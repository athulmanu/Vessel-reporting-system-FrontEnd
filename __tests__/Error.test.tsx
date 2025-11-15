// @ts-nocheck
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Error } from '../src/components/Error';

describe('Error component', () => {
      it('renders message text', () => {
            const { getByText } = render(<Error message="Something failed" />);
            expect(getByText('Something failed')).toBeTruthy();
      });

      it('invokes retry handler when button pressed', () => {
            const onRetry = jest.fn();
            const { getByText } = render(<Error message="Oops" onRetry={onRetry} />);
            fireEvent.press(getByText('Retry'));
            expect(onRetry).toHaveBeenCalledTimes(1);
      });
});


