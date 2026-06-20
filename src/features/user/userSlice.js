import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import customFetch from "../../utils/axios";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  addUserToLocalStorage,
} from "../../utils/localStorage";
import { clearAllJobsState, getAllJobs, showStats } from "../alljobs/allJobsSlice";
import { clearValues } from "../Job/jobSlice";

const initialState = {
  isLoading: false,
  isSidebarOpen: false,
  user: getUserFromLocalStorage(),
};

export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (user, thunkAPI) => {
    try {
      const response = await customFetch.post("/auth/register", user);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.msg);
    }
  }
);

// Mock user for testing without backend
const MOCK_USER = {
  name: 'Test User',
  email: 'testUser@test.com',
  token: 'mock-token-12345',
  lastName: 'User',
  location: 'United States'
};

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (user, thunkAPI) => {
    try {
      // Check if it's the test user
      if (user.email === 'testUser@test.com' && user.password === 'secret') {
        // Dispatch jobs and stats actions for mock data
        thunkAPI.dispatch(getAllJobs());
        thunkAPI.dispatch(showStats());
        // Return mock user response
        return { user: MOCK_USER };
      }
      
      // Otherwise try real API
      const response = await customFetch.post("/auth/login", user);
      thunkAPI.dispatch(getAllJobs());
      thunkAPI.dispatch(showStats());
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.msg);
    }
  }
);

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (user, thunkAPI) => {
    try {
      const resp = await customFetch.patch("/auth/updateUser", user, {
        headers: {
          authorization: `Bearer ${thunkAPI.getState().user.user.token}`,
        },
      });
      return resp.data;
    } catch (error) {
      if(error.response.status === 401){
        thunkAPI.dispatch(logoutUser());
        return thunkAPI.rejectWithValue('Unauthorized! Logging out...')
      }
      console.log(error.response);
      return thunkAPI.rejectWithValue(error.response.data.msg);
    }
  }
);

export const clearStore = createAsyncThunk( 'user/clearStore', async (message, thunkAPI) => {
  try {
       thunkAPI.dispatch(logoutUser(message));

       thunkAPI.dispatch(clearAllJobsState());

       thunkAPI.dispatch(clearValues());

       return Promise.resolve();
  } catch (error) {
      return Promise.reject();
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    toggleSideBar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },

    logoutUser: (state, {payload}) => {
      state.user = null;
      state.isSidebarOpen = false;
      removeUserFromLocalStorage();
      if(payload){
        toast.success(payload);
      }
    },
  },
  // extraReducers: {
  //   [registerUser.pending]: (state) => {
  //     state.isLoading = true;
  //   },
  //   [registerUser.fulfilled]: (state, { payload }) => {
  //     const { user } = payload;
  //     state.isLoading = false;
  //     state.user = user;
  //     addUserToLocalStorage(user);
  //     toast.success(`Hello there ${user.name}`);
  //   },
  //   [registerUser.rejected]: (state, { payload }) => {
  //     state.isLoading = false;
  //     toast.error(payload);
  //   },
  //   [loginUser.pending]: (state) => {
  //     state.isLoading = true;
  //   },
  //   [loginUser.fulfilled]: (state, { payload }) => {
  //     const { user } = payload;
  //     state.isLoading = false;
  //     state.user = user;
  //     addUserToLocalStorage(user);
  //     toast.success(`Welcome back ${user.name}`);
  //   },
  //   [loginUser.rejected]: (state, { payload }) => {
  //     state.isLoading = false;
  //     toast.error(payload);
  //   },

  //   [updateUser.pending] : (state) => {
  //       state.isLoading = true;
  //   },

  //   [updateUser.fulfilled] : (state, {payload}) => {
  //       const {user} = payload;
  //       state.isLoading = false;
  //       state.user = user;
  //       addUserToLocalStorage(user);
  //       toast.success('User updated');
  //   },

  //   [updateUser.rejected] : (state, {payload}) =>{
  //       state.isLoading = false;
  //       toast.error(payload);
  //   },

  //   [clearStore.rejected] : () =>{
  //       toast.error('There was an error');
  //   },
    

  // },

  extraReducers: (builder) => {
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(registerUser.fulfilled, (state, { payload }) => {
      const { user } = payload;
      state.isLoading = false;
      state.user = user;
      addUserToLocalStorage(user);
      toast.success(`Hello there ${user.name}`);
    })
    .addCase(registerUser.rejected, (state, { payload }) => {
      state.isLoading = false;
      toast.error(payload);
    })
    .addCase(loginUser.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(loginUser.fulfilled, (state, { payload }) => {
      const { user } = payload;
      state.isLoading = false;
      state.user = user;
      addUserToLocalStorage(user);
      toast.success(`Welcome back ${user.name}`);
    })
    .addCase(loginUser.rejected, (state, { payload }) => {
      state.isLoading = false;
      toast.error(payload);
    })
  
    .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
    })
  
    .addCase(updateUser.fulfilled , (state, {payload}) => {
        const {user} = payload;
        state.isLoading = false;
        state.user = user;
        addUserToLocalStorage(user);
        toast.success('User updated');
    })
  
    .addCase(updateUser.rejected , (state, {payload}) =>{
        state.isLoading = false;
        toast.error(payload);
    })
  
    .addCase(clearStore.rejected, () =>{
        toast.error('There was an error');
    })
    
  
  },
});

export const { toggleSideBar, logoutUser } = userSlice.actions;
export default userSlice.reducer;


// extraReducers: (builder) => {
//   builder.addCase(registerUser.pending, (state) => {
//     state.isLoading = true;
//   })
//   .addCase(registerUser.fulfilled, (state, { payload }) => {
//     const { user } = payload;
//     state.isLoading = false;
//     state.user = user;
//     addUserToLocalStorage(user);
//     toast.success(`Hello there ${user.name}`);
//   })
//   .addCase(registerUser.rejected, (state, { payload }) => {
//     state.isLoading = false;
//     toast.error(payload);
//   })
//   .addCase(loginUser.pending, (state) => {
//     state.isLoading = true;
//   })
//   .addCase(loginUser.fulfilled, (state, { payload }) => {
//     const { user } = payload;
//     state.isLoading = false;
//     state.user = user;
//     addUserToLocalStorage(user);
//     toast.success(`Welcome back ${user.name}`);
//   })
//   .addCase(loginUser.rejected, (state, { payload }) => {
//     state.isLoading = false;
//     toast.error(payload);
//   })

//   .addCase(updateUser.pending, (state) => {
//       state.isLoading = true;
//   })

//   .addCase(updateUser.fulfilled , (state, {payload}) => {
//       const {user} = payload;
//       state.isLoading = false;
//       state.user = user;
//       addUserToLocalStorage(user);
//       toast.success('User updated');
//   })

//   .addCase(updateUser.rejected , (state, {payload}) =>{
//       state.isLoading = false;
//       toast.error(payload);
//   })

//   .addCase(clearStore.rejected, () =>{
//       toast.error('There was an error');
//   })
  

// },