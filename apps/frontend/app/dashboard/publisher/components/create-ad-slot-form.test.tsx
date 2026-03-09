import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateAdSlotForm } from './create-ad-slot-form';

// Mock the API module
vi.mock('@/lib/api', () => ({
  createAdSlot: vi.fn(),
}));

import { createAdSlot } from '@/lib/api';
const mockCreateAdSlot = vi.mocked(createAdSlot);

describe('CreateAdSlotForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the "Add Ad Slot" button', () => {
    render(<CreateAdSlotForm onSuccess={mockOnSuccess} />);
    expect(screen.getByText('Add Ad Slot')).toBeInTheDocument();
  });

  it('opens the form when the button is clicked', () => {
    render(<CreateAdSlotForm onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    expect(screen.getByText('Create New Ad Slot')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/base price/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<CreateAdSlotForm onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Add Ad Slot'));
    fireEvent.click(screen.getByText('Create Ad Slot'));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Type is required')).toBeInTheDocument();
    expect(screen.getByText('Base price must be a positive number')).toBeInTheDocument();
    expect(mockCreateAdSlot).not.toHaveBeenCalled();
  });

  it('shows validation error for missing name only', async () => {
    render(<CreateAdSlotForm onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    // Fill type and price but not name
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: 'DISPLAY' } });
    fireEvent.change(screen.getByLabelText(/base price/i), { target: { value: '500' } });
    fireEvent.click(screen.getByText('Create Ad Slot'));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.queryByText('Type is required')).not.toBeInTheDocument();
    expect(screen.queryByText('Base price must be a positive number')).not.toBeInTheDocument();
  });

  it('shows validation error for zero/negative price', async () => {
    render(<CreateAdSlotForm onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Slot' } });
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: 'DISPLAY' } });
    fireEvent.change(screen.getByLabelText(/base price/i), { target: { value: '0' } });
    fireEvent.click(screen.getByText('Create Ad Slot'));

    expect(screen.getByText('Base price must be a positive number')).toBeInTheDocument();
    expect(mockCreateAdSlot).not.toHaveBeenCalled();
  });

  it('clears validation error when user fixes the field', async () => {
    render(<CreateAdSlotForm onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Add Ad Slot'));
    fireEvent.click(screen.getByText('Create Ad Slot'));

    expect(screen.getByText('Name is required')).toBeInTheDocument();

    // Type a name — error should clear
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Fixed' } });
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
  });

  it('calls createAdSlot with correct data on valid submission', async () => {
    mockCreateAdSlot.mockResolvedValue({} as any);

    render(<CreateAdSlotForm onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Header Banner' } });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Top of page' },
    });
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: 'DISPLAY' } });
    fireEvent.change(screen.getByLabelText(/base price/i), { target: { value: '500' } });
    fireEvent.click(screen.getByText('Create Ad Slot'));

    await waitFor(() => {
      expect(mockCreateAdSlot).toHaveBeenCalledWith({
        name: 'Header Banner',
        description: 'Top of page',
        type: 'DISPLAY',
        basePrice: 500,
      });
    });
  });

  it('calls onSuccess callback after successful creation', async () => {
    mockCreateAdSlot.mockResolvedValue({} as any);

    render(<CreateAdSlotForm onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: 'VIDEO' } });
    fireEvent.change(screen.getByLabelText(/base price/i), { target: { value: '300' } });
    fireEvent.click(screen.getByText('Create Ad Slot'));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('closes the form after successful creation', async () => {
    mockCreateAdSlot.mockResolvedValue({} as any);

    render(<CreateAdSlotForm onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: 'NATIVE' } });
    fireEvent.change(screen.getByLabelText(/base price/i), { target: { value: '200' } });
    fireEvent.click(screen.getByText('Create Ad Slot'));

    await waitFor(() => {
      expect(screen.queryByText('Create New Ad Slot')).not.toBeInTheDocument();
    });
    // Button should be back
    expect(screen.getByText('Add Ad Slot')).toBeInTheDocument();
  });

  it('shows error message when API call fails', async () => {
    mockCreateAdSlot.mockRejectedValue(new Error('API error'));

    render(<CreateAdSlotForm onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: 'DISPLAY' } });
    fireEvent.change(screen.getByLabelText(/base price/i), { target: { value: '100' } });
    fireEvent.click(screen.getByText('Create Ad Slot'));

    await waitFor(() => {
      expect(screen.getByText(/failed to create/i)).toBeInTheDocument();
    });

    // Form should stay open
    expect(screen.getByText('Create New Ad Slot')).toBeInTheDocument();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('closes the form when cancel is clicked', () => {
    render(<CreateAdSlotForm onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    expect(screen.getByText('Create New Ad Slot')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.queryByText('Create New Ad Slot')).not.toBeInTheDocument();
    expect(screen.getByText('Add Ad Slot')).toBeInTheDocument();
  });

  it('resets form fields when cancelled and reopened', () => {
    render(<CreateAdSlotForm onSuccess={mockOnSuccess} />);

    // Open and fill some fields
    fireEvent.click(screen.getByText('Add Ad Slot'));
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Dirty Data' } });
    fireEvent.click(screen.getByText('Cancel'));

    // Reopen — should be clean
    fireEvent.click(screen.getByText('Add Ad Slot'));
    expect(screen.getByLabelText(/name/i)).toHaveValue('');
  });

  it('renders all 5 ad slot type options', () => {
    render(<CreateAdSlotForm onSuccess={mockOnSuccess} />);
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

  it('omits description from API call when left empty', async () => {
    mockCreateAdSlot.mockResolvedValue({} as any);

    render(<CreateAdSlotForm onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Add Ad Slot'));

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'No Desc Slot' } });
    // Leave description empty
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: 'PODCAST' } });
    fireEvent.change(screen.getByLabelText(/base price/i), { target: { value: '750' } });
    fireEvent.click(screen.getByText('Create Ad Slot'));

    await waitFor(() => {
      expect(mockCreateAdSlot).toHaveBeenCalledWith({
        name: 'No Desc Slot',
        description: undefined,
        type: 'PODCAST',
        basePrice: 750,
      });
    });
  });
});
