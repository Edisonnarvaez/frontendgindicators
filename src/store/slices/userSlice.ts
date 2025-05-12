import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState } from '../types/rbac';

const initialState: UserState = {
  id: 0,
  username: '',
  email: '',
  role: {
    role: 'lector', // Rol por defecto
    permissions: [],
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.role = action.payload.role;
    },
    clearUser(state) {
      state.id = 0;
      state.username = '';
      state.email = '';
      state.role = { role: 'lector', permissions: [] };
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;