import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useMemo, useState, useCallback, useRef, memo, useEffect } from "react"
import { useDebounce } from "use-debounce"
import { useUsers } from "../hooks/useUsers"
import type { User } from "@/utils/generateUsers"
import UserModal from "./UserModal"

// expensive computationn
const calculateReputationScore = (user: User): number => {
  let score = 0
  
  for (let i = 0; i < 1000; i++) {
    score += user.age * 0.1
    score += user.name.length * 2
    score += user.email.includes('.com') ? 10 : 5
  }
  
  return Math.round(score % 100)
}

// memoized row component - prevent unnecessary re-renders
const TableRow = memo(({ 
  row, 
  onClick 
}: { 
  row: any
  onClick: (user: User) => void 
}) => {
  return (
    <tr 
      className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onClick(row.original)}
    >
      {row.getVisibleCells().map((cell: any) => (
        <td key={cell.id} className="p-3 text-sm">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  )
})

TableRow.displayName = 'TableRow'

const UsersTable = () => {
  const { users, setUsers } = useUsers()
  
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  // const [error, setError] = useState<string | null>(null)
  
  // debounced search 300ms
  const [debouncedSearch] = useDebounce(search, 300)
  
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // infinite scroll state
  const [displayCount, setDisplayCount] = useState(50) // Start with 50 users
  const ITEMS_PER_PAGE = 50

  // reset display count when filters change
  useEffect(() => {
    setDisplayCount(50)
  }, [debouncedSearch, roleFilter])

  // filtered + sorted data with infinite scroll
  const filteredData = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearch.toLowerCase())

      const matchesRole = roleFilter ? user.role === roleFilter : true

      return matchesSearch && matchesRole
    })

    return filtered
  }, [users, debouncedSearch, roleFilter])

  // display only a subset for infinite scrol
  const displayedData = useMemo(() => {
    return filteredData.slice(0, displayCount)
  }, [filteredData, displayCount])

  // columns with expensive computation
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="text-gray-600">{row.original.email}</div>
        ),
      },
      {
        accessorKey: "age",
        header: "Age",
        cell: ({ row }) => (
          <div className="text-center">{row.original.age}</div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {row.original.role}
          </span>
        ),
      },
      {
        accessorKey: "reputation",
        header: "Reputation",
        cell: ({ row }) => {
          // expensive computation
          const score = calculateReputationScore(row.original)
          return (
            <div className="flex items-center gap-2">
              <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">{score}</span>
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: displayedData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { rows } = table.getRowModel()

  // infinite scroll:
  useEffect(() => {
    const container = tableContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

      // load more when 95% scrolled and if there's more data to show
      if (scrollPercentage > 0.95 && displayCount < filteredData.length && !isLoading) {
        setIsLoading(true)
        
        // simulate loading delay for smooth UX
        setTimeout(() => {
          setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredData.length))
          setIsLoading(false)
        }, 300)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [displayCount, filteredData.length, isLoading])

  // virtualization setup
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 50, // estimated row height
    overscan: 10,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)
      : 0

  // memoized handlers
  const handleRowClick = useCallback((user: User) => {
    setSelectedUser(user)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedUser(null)
  }, [])

  const handleUpdateUser = useCallback((updatedUser: User) => {
    setUsers(prevUsers =>
      prevUsers.map(u => (u.id === updatedUser.id ? updatedUser : u))
    )
  }, [setUsers])

  return (
    <div className="p-7 lg:p-16 bg-white">
      <div className="mb-6">
        <h1 className="font-bold text-[40px] leading-[100%] mb-[12px]">Users Dashboard</h1>
        <p className="text-[#00000080] font-medium text-[1.063rem] leading-[100%]">
          Showing {displayedData.length.toLocaleString()} of {filteredData.length.toLocaleString()} users
          {filteredData.length !== users.length && ` (filtered from ${users.length.toLocaleString()} total)`}
        </p>
      </div>

      {/* search & filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="relative flex items-center pl-[20px] rounded-[16px] border-[2px] border-[#E0DCDC]">
            <label htmlFor="search" className="shrink-0 py-[14px]">
              <svg className="w-[24px] h-[24px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="#9E9E9E" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.34-4.34M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/></svg>
            </label>

            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="outline-none placeholder:text-[#9E9E9E] text-black font-semibold text-[1rem] leading-[150%] tracking-[0%] pl-[12px] pr-[20px] py-[14px] w-full grow"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            
            />
          </div>
        </div>

        <select
          className="role-select border-2 border-[#E0DCDC] rounded-[16px] pl-4 pr-3 min-w-[150px] text-black font-semibold text-[1rem] leading-[150%] tracking-[0%] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={roleFilter || ""}
          onChange={(e) => setRoleFilter(e.target.value || null)}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="manager">Manager</option>
        </select>
      </div>

      {/* error state */}
      {/* {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )} */}

      {/* cirtualized table */}
      <div className="border rounded-lg shadow-sm overflow-hidden">
        <div
          ref={tableContainerRef}
          className="overflow-auto h-[600px] relative"
        >
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10 border-b">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="p-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() && (
                          <span>
                            {header.column.getIsSorted() === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {paddingTop > 0 && (
                    <tr>
                      <td style={{ height: `${paddingTop}px` }} />
                    </tr>
                  )}
                  
                  {virtualRows.map(virtualRow => {
                    const row = rows[virtualRow.index]
                    return (
                      <TableRow
                        key={row.id}
                        row={row}
                        onClick={handleRowClick}
                      />
                    )
                  })}

                  {paddingBottom > 0 && (
                    <tr>
                      <td style={{ height: `${paddingBottom}px` }} />
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* loading (infinite scroll) */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}

      {/* user modal */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={handleCloseModal}
          onUpdate={handleUpdateUser}
        />
      )}
    </div>
  )
}

export default UsersTable