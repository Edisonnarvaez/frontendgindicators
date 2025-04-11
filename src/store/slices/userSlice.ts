// store/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: number | null;
  // Agrega aquí más campos si los necesitas
}

const initialState: UserProfile | null = null as UserProfile | null;

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (_state, action: PayloadAction<UserProfile>) => {
      return action.payload as UserProfile;
    },
    clearUserProfile: () => null,
  },
});

export const { setUserProfile, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
