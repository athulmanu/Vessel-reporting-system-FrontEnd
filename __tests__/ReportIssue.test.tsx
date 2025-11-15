// @ts-nocheck
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ReportIssue from '../src/screens/Crew/ReportIssue';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

const mockUseAuth = jest.fn();
jest.mock('../src/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseFetchMyIssues = jest.fn();
const mockUseFetchIssues = jest.fn();
const mockUseCreateIssue = jest.fn();

jest.mock('../src/hooks/useIssues', () => ({
  useFetchMyIssues: (...args: any[]) => mockUseFetchMyIssues(...args),
  useFetchIssues: (...args: any[]) => mockUseFetchIssues(...args),
  useCreateIssue: () => mockUseCreateIssue(),
}));

describe('ReportIssue screen', () => {
  const mutateAsync = jest.fn().mockResolvedValue({});

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { assignedVesselIds: ['vessel-1'] },
    });
    mockUseFetchMyIssues.mockReturnValue({
      data: {
        data: {
          issues: [
            {
              vesselId: {
                _id: 'vessel-1',
                name: 'Aurora',
                type: 'Bulk',
                status: 'Active',
              },
              status: 'Open',
            },
          ],
        },
      },
      isLoading: false,
    });
    mockUseFetchIssues.mockReturnValue({
      data: { data: { issues: [] } },
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn(),
      error: null,
    });
    mockUseCreateIssue.mockReturnValue({
      mutateAsync,
      isPending: false,
    });
  });

  it('shows validation alert when submitting without selecting vessel', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { getByText } = render(<ReportIssue />);
    fireEvent.press(getByText('Submit Issue'));

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Please select a vessel');
    alertSpy.mockRestore();
  });

  it('submits issue after filling fields', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByText, getByPlaceholderText } = render(<ReportIssue />);

    fireEvent.press(getByText('Aurora'));
    fireEvent.changeText(getByPlaceholderText('e.g., Engine, Hull, Electrical'), 'Engine');
    fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'Oil leak detected');

    fireEvent.press(getByText('Submit Issue'));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        vesselId: 'vessel-1',
        category: 'Engine',
        description: 'Oil leak detected',
        priority: 'Medium',
      });
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Success',
      'Issue reported successfully',
      expect.any(Array)
    );
    alertSpy.mockRestore();
  });
});


