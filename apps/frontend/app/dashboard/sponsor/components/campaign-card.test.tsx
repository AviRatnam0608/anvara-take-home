import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CampaignCard } from './campaign-card';
import type { Campaign } from '@/lib/types';

// Mock the server actions module — server actions can't run in jsdom
vi.mock('../actions', () => ({
  deleteCampaignAction: vi.fn(),
  updateCampaignAction: vi.fn(),
}));

const baseCampaign: Campaign = {
  id: 'c1',
  name: 'Q1 Product Launch',
  description: 'Launch campaign for our new product',
  budget: 10000,
  spent: 2500,
  status: 'ACTIVE',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-03-31T00:00:00.000Z',
  sponsorId: 's1',
};

describe('CampaignCard', () => {
  it('renders the campaign name', () => {
    render(<CampaignCard campaign={baseCampaign} />);
    expect(screen.getByText('Q1 Product Launch')).toBeInTheDocument();
  });

  it('renders the status badge', () => {
    render(<CampaignCard campaign={baseCampaign} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies correct class for ACTIVE status', () => {
    render(<CampaignCard campaign={baseCampaign} />);
    const badge = screen.getByText('Active');
    expect(badge.className).toContain('bg-[var(--color-success-subtle)]');
  });

  it('applies correct class for DRAFT status', () => {
    render(<CampaignCard campaign={{ ...baseCampaign, status: 'DRAFT' }} />);
    const badge = screen.getByText('Draft');
    expect(badge.className).toContain('bg-[var(--color-bg-input)]');
  });

  it('applies correct class for PAUSED status', () => {
    render(<CampaignCard campaign={{ ...baseCampaign, status: 'PAUSED' }} />);
    const badge = screen.getByText('Paused');
    expect(badge.className).toContain('bg-[var(--color-warning-subtle)]');
  });

  it('applies correct class for COMPLETED status', () => {
    render(<CampaignCard campaign={{ ...baseCampaign, status: 'COMPLETED' }} />);
    const badge = screen.getByText('Completed');
    expect(badge.className).toContain('bg-[var(--color-primary-subtle)]');
  });

  it('renders description when provided', () => {
    render(<CampaignCard campaign={baseCampaign} />);
    expect(screen.getByText('Launch campaign for our new product')).toBeInTheDocument();
  });

  it('does not render description when absent', () => {
    const { description: _unused, ...noDesc } = baseCampaign;
    render(<CampaignCard campaign={noDesc} />);
    expect(screen.queryByText('Launch campaign for our new product')).not.toBeInTheDocument();
  });

  it('renders budget display', () => {
    render(<CampaignCard campaign={baseCampaign} />);
    expect(screen.getByText('Budget')).toBeInTheDocument();
    // Budget line: $2,500 / $10,000
    expect(screen.getByText(/2,500/)).toBeInTheDocument();
    expect(screen.getByText(/10,000/)).toBeInTheDocument();
  });

  it('renders progress bar with correct width', () => {
    const { container } = render(<CampaignCard campaign={baseCampaign} />);
    // 2500/10000 = 25%
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toBeTruthy();
    expect(progressBar?.getAttribute('style')).toContain('25%');
  });

  it('caps progress bar at 100% when spent exceeds budget', () => {
    const { container } = render(
      <CampaignCard campaign={{ ...baseCampaign, spent: 15000 }} />,
    );
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar?.getAttribute('style')).toContain('100%');
  });

  it('handles zero budget without division error', () => {
    const { container } = render(
      <CampaignCard campaign={{ ...baseCampaign, budget: 0, spent: 0 }} />,
    );
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar?.getAttribute('style')).toContain('0%');
  });

  it('renders date range', () => {
    render(<CampaignCard campaign={baseCampaign} />);
    // Dates formatted via toLocaleDateString — just check they're present
    expect(screen.getByText(/–/)).toBeInTheDocument();
  });
});
