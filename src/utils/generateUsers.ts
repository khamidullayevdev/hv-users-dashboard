export interface User {
  id: string
  name: string
  email: string
  age: number
  role: "admin" | "user" | "manager"
}

const firstNames = [
  "John", "Jane", "Michael", "Emily", "David", "Sarah", "Chris", "Emma",
  "Daniel", "Olivia", "James", "Sophia", "Robert", "Isabella", "William",
  "Mia", "Thomas", "Charlotte", "Joseph", "Amelia", "Charles", "Harper",
  "Christopher", "Evelyn", "Matthew", "Abigail", "Andrew", "Elizabeth",
  "Joshua", "Sofia", "Ryan", "Avery", "Nicholas", "Ella", "Alexander",
  "Scarlett", "Jonathan", "Grace", "Brandon", "Chloe", "Tyler", "Victoria",
  "Kevin", "Madison", "Zachary", "Luna", "Justin", "Hannah", "Benjamin",
]

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez",
  "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright",
  "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams",
  "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter",
]

const roles: Array<"admin" | "user" | "manager"> = ["admin", "user", "manager"]

const domains = ["gmail.com", "yahoo.com", "outlook.com", "company.com", "email.com"]

export const generateUsers = (count: number): User[] => {
  const users: User[] = []

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const name = `${firstName} ${lastName}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${
      domains[Math.floor(Math.random() * domains.length)]
    }`
    const age = Math.floor(Math.random() * (65 - 18 + 1)) + 18
    const role = roles[Math.floor(Math.random() * roles.length)]

    users.push({
      id: `user-${i + 1}`,
      name,
      email,
      age,
      role,
    })
  }

  return users
}