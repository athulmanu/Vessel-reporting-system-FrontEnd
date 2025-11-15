// @ts-nocheck
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GlobalErrorBoundary } from '../src/components/GlobalErrorBoundary';
import { Text, TouchableOpacity } from 'react-native';

const ProblemChild = () => {
  throw new Error('Boom');
};

const SafeChild = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <Text>Click</Text>
  </TouchableOpacity>
);

describe('GlobalErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    const { getByText } = render(
      <GlobalErrorBoundary>
        <Text>All good</Text>
      </GlobalErrorBoundary>
    );
    expect(getByText('All good')).toBeTruthy();
  });

  it('shows fallback UI when child throws', () => {
    const { getByText } = render(
      <GlobalErrorBoundary>
        <ProblemChild />
      </GlobalErrorBoundary>
    );
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('recovers after pressing Try Again', () => {
    const { getByText, rerender } = render(
      <GlobalErrorBoundary>
        <ProblemChild />
      </GlobalErrorBoundary>
    );
    fireEvent.press(getByText('Try Again'));

    const handlePress = jest.fn();
    rerender(
      <GlobalErrorBoundary>
        <SafeChild onPress={handlePress} />
      </GlobalErrorBoundary>
    );

    fireEvent.press(getByText('Click'));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });
});


