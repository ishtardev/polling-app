// __mocks__/next_navigation.js
export const useRouter = jest.fn(() => ({
  push: jest.fn(),
}));
