import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CampaignList } from './campaign-list';
import type { Campaign } from '@/lib/types';

const campaigns: Campaign[] = [
  {
    id: 'c1',
    name: 'Q1 Launch',
    budget: 10000,
    spent: 2500,
    status: 'ACTIVE',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    sponsorId: 's1',
  },
  {
    id: 'c2',
    name: 'Brand Awareness',
    budget: 5000,
    spent: 0,
    status: 'DRAFT',
    startDate: '2026-02-01',
    endDate: '2026-04-30',
    sponsorId: 's1',
  },
];

describe('CampaignList', () => {
  it('renders empty state when no campaigns', () => {
    render(<CampaignList campaigns={[]} />);
    expect(screen.getByText(/no campaigns yet/i)).toBeInTheDocument();
  });

  it('renders the correct number of campaign cards', () => {
    render(<CampaignList campaigns={campaigns} />);
    expect(screen.getByText('Q1 Launch')).toBeInTheDocument();
    expect(screen.getByText('Brand Awareness')).toBeInTheDocument();
  });

  it('renders in a grid layout', () => {
    const { container } = render(<CampaignList campaigns={campaigns} />);
    const grid = container.querySelector('.card-grid');
    expect(grid).toBeTruthy();
    expect(grid?.children).toHaveLength(2);
  });
});
