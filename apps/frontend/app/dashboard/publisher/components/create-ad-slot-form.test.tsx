import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateAdSlotForm } from './create-ad-slot-form';
import type { ActionState } from '@/lib/types';

// Mock the server actions module — server actions can't run in jsdom
vi.mock('../actions', () => ({
  createAdSlotAction: vi.fn(),
}));

// We control what useActionState returns for each test
let mockState: ActionState = {};
const mockFormAction = vi.fn();

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useActionState: vi.fn(() => [mockState, mockFormAction]),
  };
});

describe('CreateAdSlotForm', () => {
  beforeEach(() => {
    mockState = {};
    vi.clearAllMocks();
  });

  it('renders the "Add Ad Slot" button', () => {
    render(<CreateAdSlotForm />);
    expect(screen.getByText('Add Ad Slot')).toBeInTheDocument();
  });

  it('opens the form when the button is clicked', () => {
    render(<CreateAdSlotForm />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    expect(screen.getByText('Create New Ad Slot')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/base price/i)).toBeInTheDocument();
  });

  it('closes the form when cancel is clicked', () => {
    render(<CreateAdSlotForm />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    expect(screen.getByText('Create New Ad Slot')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.queryByText('Create New Ad Slot')).not.toBeInTheDocument();
    expect(screen.getByText('Add Ad Slot')).toBeInTheDocument();
  });

  it('renders all 5 ad slot type options', () => {
    render(<CreateAdSlotForm />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    const select = screen.getByLabelText(/type/i);
    expect(select).toBeInTheDocument();

    // 5 type options + 1 placeholder = 6
    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(6);
    expect(options[1]).toHaveTextContent('Display');
    expect(options[2]).toHaveTextContent('Video');
    expect(options[3]).toHaveTextContent('Native');
    expect(options[4]).toHaveTextContent('Newsletter');
    expect(options[5]).toHaveTextContent('Podcast');
  });

  it('displays field-level validation errors from server action', () => {
    mockState = {
      fieldErrors: {
        name: 'Name is required',
        type: 'Type is required',
        basePrice: 'Base price must be a positive number',
      },
    };

    render(<CreateAdSlotForm />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Type is required')).toBeInTheDocument();
    expect(screen.getByText('Base price must be a positive number')).toBeInTheDocument();
  });

  it('displays a single field error without showing others', () => {
    mockState = {
      fieldErrors: {
        name: 'Name is required',
      },
    };

    render(<CreateAdSlotForm />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.queryByText('Type is required')).not.toBeInTheDocument();
    expect(screen.queryByText('Base price must be a positive number')).not.toBeInTheDocument();
  });

  it('displays server error message from action', () => {
    mockState = { error: 'Failed to create ad slot' };

    render(<CreateAdSlotForm />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    expect(screen.getByText('Failed to create ad slot')).toBeInTheDocument();
    // Form should stay open on error
    expect(screen.getByText('Create New Ad Slot')).toBeInTheDocument();
  });

  it('renders the submit button with correct text', () => {
    render(<CreateAdSlotForm />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    expect(screen.getByRole('button', { name: 'Create Ad Slot' })).toBeInTheDocument();
  });

  it('form fields use correct name attributes for FormData', () => {
    render(<CreateAdSlotForm />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    // Verify name attributes so FormData works correctly with the server action
    expect(screen.getByLabelText(/^name/i)).toHaveAttribute('name', 'name');
    expect(screen.getByLabelText(/description/i)).toHaveAttribute('name', 'description');
    expect(screen.getByLabelText(/type/i)).toHaveAttribute('name', 'type');
    expect(screen.getByLabelText(/base price/i)).toHaveAttribute('name', 'basePrice');
  });

  it('highlights fields with errors via border styling', () => {
    mockState = {
      fieldErrors: {
        name: 'Name is required',
      },
    };

    render(<CreateAdSlotForm />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    const nameInput = screen.getByLabelText(/^name/i);
    expect(nameInput.className).toContain('border-red-400');
  });
});
