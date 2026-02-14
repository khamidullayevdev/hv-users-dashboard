import { generateUsers, type User } from "@/utils/generateUsers"
import { useMemo, useState } from "react"

export const useUsers = () => {
  const initialUsers = useMemo(() => generateUsers(20000), [])

  const [users, setUsers] = useState<User[]>(initialUsers)

  return {
    users,
    setUsers,
  }
}