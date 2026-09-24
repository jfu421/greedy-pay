import Dexie, { type EntityTable } from 'dexie'

interface _Group {
  id: number
  name: string
  description: string
  created: Date
  /** List of names of members of group */
  members: string[]
  items: Item[]
  /** Decides who pays leftover cents. Created the first time it is needed */
  seed?: number
}

/**
 * Compares strings by UTF-16 code units, like the default Array.sort.
 * Unlike localeCompare, the order is the same on every device.
 */
function compareStrings(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0
}

/**
 * 32-bit FNV-1a hash, followed by MurmurHash3's finaliser so that strings
 * differing only in their last character still land far apart
 */
function hash(str: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0x01000193)
  }
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  return (h ^ (h >>> 16)) >>> 0
}

/**
 * Orders strings pseudo-randomly, but always the same way for a given seed.
 * Each string's position depends only on itself and the seed, so renaming
 * one does not move the others relative to each other
 */
function compareBySeed(seed: number) {
  return (a: string, b: string) =>
    hash(`${seed}:${a}`) - hash(`${seed}:${b}`) || compareStrings(a, b)
}

class Group {
  public readonly id: number
  public readonly name: string
  public readonly description: string
  public readonly created: Date
  /** List of names of members of group */
  public readonly members: string[]
  public readonly items: Item[]
  /** Decides who pays leftover cents. Created the first time it is needed */
  public seed?: number

  private _paymentsRequired?: { [item: string]: { [member: string]: number } }
  /**
   * Keeps track of the actual amounts each person needs to pay
   * for each item (ignoring the credit for each).
   * Needs to be recalculated each time 
   * 
   * { item: { member: amount } }
   */
  public paymentsRequired() {
    if (this._paymentsRequired) return this._paymentsRequired
    // else, need to calculate payments required
    const payments: { [item: string]: { [member: string]: number } } = {}
    // Items whose total cannot be split evenly, with the cents left over
    const leftovers: { name: string, participants: string[], remainder: number }[] = []
    for (const item of this.items) {
      if (item.owers && !(item.owers instanceof Array)) {
        // Means manual splitting, assume that it is correct and add to payments
        payments[item.name] = item.owers
        continue
      }
      const total = Object.values(item.owees).reduce((a, b) => a + b, 0)
      const participants = item.owers ?? this.members
      const base = Math.floor(total / participants.length)
      payments[item.name] = Object.fromEntries(participants.map(m => [m, base]))
      // The minimum amount that cannot be split evenly among all members
      const remainder = total - (participants.length * base)
      if (remainder > 0) leftovers.push({ name: item.name, participants, remainder })
    }
    this._paymentsRequired = payments
    if (leftovers.length === 0) return payments

    // Leftover cents are handed out in an order fixed by the group's random
    // seed: rearranging rows never changes who pays them, and no name is
    // favoured across groups the way alphabetical order would be
    const bySeed = compareBySeed(this.getSeed())
    // queue to spread 'suffering' as equally as possible
    // ensure this is a copy of the members array to prevent mutation
    const nextToSuffer = this.members.slice().sort(bySeed)
    leftovers.sort((a, b) => bySeed(a.name, b.name))
    for (const { name, participants, remainder: total } of leftovers) {
      let remainder = total
      while (remainder > 0) {
        // get the next person participating in the split that should suffer
        const [sufferer] = nextToSuffer.splice(
          nextToSuffer.findIndex(m => participants.includes(m)),
          1
        )
        // ensure that they suffer less later
        nextToSuffer.push(sufferer)
        // make them suffer and reduce remaining suffering
        payments[name][sufferer]++
        remainder--
      }
    }
    return payments
  }

  private getSeed() {
    if (this.seed !== undefined) return this.seed
    // Groups made before seeds existed (or never needing one yet) have none.
    // Save one now so the leftover cents stay the same from then on
    const seed = crypto.getRandomValues(new Uint32Array(1))[0]
    this.seed = seed
    db.groups.where('id').equals(this.id).and(g => g.seed === undefined).modify({ seed })
    return seed
  }
  
  private _balances?: { [member: string]: number }
  public balances() {
    if (this._balances) return this._balances
    const balances: { [member: string]: number } = {}
    for (const member of this.members) {
      balances[member] = 0
    }
    const paymentsRequired = this.paymentsRequired()
    for (const item of this.items) {
      for (const [owee, amount] of Object.entries(item.owees)) {
        balances[owee] += amount
      }
      for (const [ower, amount] of Object.entries(paymentsRequired[item.name])) {
        balances[ower] -= amount
      }
    }
    this._balances = balances
    return balances
  }

  private _minimised?: { [payer: string]: { [payee: string] : number } }
  public minimisedTransactions() {
    if (this._minimised) return this._minimised
    // sorted so the suggested transactions don't depend on member order
    const balances = Object.fromEntries(
      Object.entries(this.balances()).sort(([a], [b]) => compareStrings(a, b))
    )
    const transactions: {
      [payer: string]: {
        [payee: string] : number
      }
    } = {}
    for (const member in balances) {
      transactions[member] = {}

      // Person is in credit, dont pay anyone
      if (balances[member] >= 0) continue

      // Person is in debt, pay people in credit until debt is gone
      while (balances[member] < 0) {
        const payee = Object.entries(balances)
          .find(([_member, balance]) => balance > 0)
        if (!payee) {
          console.error(`
            Could not find someone for ${member} to pay, even though
            ${member} is still owing ${balances[member]}.
            This could be due to floating-point error.
          `)
          break
        }
        let amountPaid = 0
        const [payeeName, payeeCredit] = payee
        if (balances[member] + payeeCredit >= 0) {
          // If debtor can get even by paying to the payee, debtor wlll pay full
          // remaining debt to the payee, and payee will have the amount
          // taken from their credit
          amountPaid = -balances[member]
          // deduct credit from payee
          balances[payeeName] = payeeCredit - amountPaid
          // payer is now even
          balances[member] = 0
        } else {
          // If debtor's current balance cannot be paid in full, debtor will pay
          // only amount equal to payee's credit
          amountPaid = payeeCredit
          // pay the payee
          balances[payeeName] = 0
          // the payer pays
          balances[member] += amountPaid
        }
        transactions[member][payeeName] = amountPaid
      }
    }
    for (const [member, amount] of Object.entries(balances)) {
      if (amount !== 0) {
        console.error(`
          After calculating transactions,
          ${member} still has a balance of ${amount}.
        `)
      }
    }
    this._minimised = transactions
    return transactions
  }
  
  constructor(groupData: _Group) {
    this.id = groupData.id
    this.name = groupData.name
    this.description = groupData.description
    this.created = groupData.created
    this.members = groupData.members
    this.items = groupData.items
    this.seed = groupData.seed
  }

  /**
   * DO NOT USE EXPLICITLY
   * 
   * Used by JSON.stringify
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      created: this.created,
      members: this.members,
      items: this.items,
      seed: this.seed,
    }
  }
}

/**
 * e.g. a ticket for a movie, dinner at some place
 * tracks who is owed money for the item (i.e. who paid) and
 * who owes money for the item (i.e. participated but did not pay)
 */
interface Item {
  name: string
  /** Who is owed money: how much they are owed */
  owees: { [member: string]: number }
  /**
   * Who owes money: how much they owe
   * 
   * - if does not exist, means split b/w everyone equally
   * - if list of strings means split b/w people in list
   * - if map, maps each person to amount they pay.
   *   note that this assumes that the total ALWAYS adds up to the amount owed
   */
  owers?: string[] | { [member: string]: number }
}

const db = new Dexie('Database') as Dexie & {
  groups: EntityTable<Group, 'id'>
}

// Schema declaration:
db.version(1).stores({
  groups: '++id, name' // primary key "id" (for the runtime!)
})

db.groups.mapToClass(Group)

export type { Item }
export { Group }
export default db
