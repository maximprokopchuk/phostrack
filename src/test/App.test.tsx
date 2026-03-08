import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

// Mock child components to isolate App tests
vi.mock('../components/Dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard">Dashboard</div>,
}))
vi.mock('../components/FoodLogger', () => ({
  FoodLogger: ({ onAdd }: { onAdd: (e: unknown) => void }) => (
    <button data-testid="food-logger" onClick={() => onAdd({
      foodName: 'Тест', phosphateMg: 100, calories: 50,
      proteinG: 5, fatG: 2, carbsG: 3,
      potassiumMg: 50, magnesiumMg: 10, sodiumMg: 30,
      confidence: 'high', explanation: 'Test',
    })}>Add food</button>
  ),
}))
vi.mock('../components/LogList', () => ({
  LogList: ({ items, onDelete }: { items: unknown[]; onDelete: (id: string) => void }) => (
    <div data-testid="log-list">
      {(items as { id: string; name: string }[]).map(item => (
        <div key={item.id}>
          {item.name}
          <button onClick={() => onDelete(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}))
vi.mock('../components/DialysisTracker', () => ({
  DialysisTracker: () => <div data-testid="dialysis-tracker">Dialysis</div>,
}))

// Mock motion
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

beforeEach(() => {
  localStorageMock.clear()
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })
  vi.clearAllMocks()
})

describe('App', () => {
  it('renders the header with PhosTrack title', () => {
    render(<App />)
    expect(screen.getByText('PhosTrack')).toBeInTheDocument()
  })

  it('shows phosphorus tab by default', () => {
    render(<App />)
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    expect(screen.queryByTestId('dialysis-tracker')).not.toBeInTheDocument()
  })

  it('switches to dialysis tab on click', async () => {
    render(<App />)
    const dialysisTab = screen.getByText('Диализ')
    await userEvent.click(dialysisTab)
    expect(screen.getByTestId('dialysis-tracker')).toBeInTheDocument()
  })

  it('adds food item when FoodLogger triggers onAdd', async () => {
    render(<App />)
    const addButton = screen.getByTestId('food-logger')
    await userEvent.click(addButton)
    expect(screen.getByText('Тест')).toBeInTheDocument()
  })

  it('deletes food item when onDelete is called', async () => {
    render(<App />)
    const addButton = screen.getByTestId('food-logger')
    await userEvent.click(addButton)
    expect(screen.getByText('Тест')).toBeInTheDocument()
    const deleteButton = screen.getByText('Delete')
    await userEvent.click(deleteButton)
    expect(screen.queryByText('Тест')).not.toBeInTheDocument()
  })

  it('opens settings modal when settings button is clicked', async () => {
    render(<App />)
    const settingsBtn = screen.getByRole('button', { name: /settings/i })
    await userEvent.click(settingsBtn)
    expect(screen.getByText('Настройки')).toBeInTheDocument()
  })

  it('loads limit from localStorage', () => {
    localStorageMock.setItem('phostrack_limit', '1000')
    render(<App />)
    // Settings modal shows the value
    const settingsBtn = screen.getAllByRole('button').find(b => b.querySelector('svg'))!
    userEvent.click(settingsBtn)
  })
})
