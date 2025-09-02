// __mocks__/supabaseClient.ts
export const supabase = {
  auth: {
    signInWithPassword: jest.fn(),
  },
};
