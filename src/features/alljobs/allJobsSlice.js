import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {toast} from 'react-toastify';
import customFetch from "../../utils/axios";


const initialFilterState = {
    search : '',
    searchOptions : 'all',
    searchType : 'all',
    searchStatus : 'all',
    sort : 'latest',
    sortOptions :['latest', 'oldest', 'a-z', 'z-a' ],

};

const initialState = {
    isLoading : true,
    jobs: [],
    totalJobs : 0,
    numOfPages : 1,
    page :1,
    stats : {},
    monthlyApplications : [],
    ...initialFilterState,
};

// Mock data for test user
const MOCK_JOBS = [
    {
        _id: '1',
        position: 'Senior React Developer',
        company: 'Google',
        jobLocation: 'New York, NY',
        jobType: 'full-time',
        status: 'pending',
        createdAt: '2026-06-15'
    },
    {
        _id: '2',
        position: 'Full Stack Developer',
        company: 'Microsoft',
        jobLocation: 'Seattle, WA',
        jobType: 'full-time',
        status: 'interview',
        createdAt: '2026-06-10'
    },
    {
        _id: '3',
        position: 'Frontend Engineer',
        company: 'Amazon',
        jobLocation: 'Remote',
        jobType: 'remote',
        status: 'pending',
        createdAt: '2026-06-05'
    },
    {
        _id: '4',
        position: 'Junior Developer',
        company: 'Apple',
        jobLocation: 'Cupertino, CA',
        jobType: 'part-time',
        status: 'declined',
        createdAt: '2026-05-28'
    },
    {
        _id: '5',
        position: 'DevOps Engineer',
        company: 'Meta',
        jobLocation: 'Remote',
        jobType: 'full-time',
        status: 'interview',
        createdAt: '2026-05-20'
    },
    {
        _id: '6',
        position: 'Backend Developer',
        company: 'Netflix',
        jobLocation: 'Los Gatos, CA',
        jobType: 'full-time',
        status: 'pending',
        createdAt: '2026-06-18'
    },
    {
        _id: '7',
        position: 'UI/UX Designer',
        company: 'Airbnb',
        jobLocation: 'San Francisco, CA',
        jobType: 'full-time',
        status: 'interview',
        createdAt: '2026-06-12'
    },
    {
        _id: '8',
        position: 'Data Scientist',
        company: 'Tesla',
        jobLocation: 'Palo Alto, CA',
        jobType: 'full-time',
        status: 'pending',
        createdAt: '2026-06-08'
    },
    {
        _id: '9',
        position: 'QA Engineer',
        company: 'Uber',
        jobLocation: 'San Francisco, CA',
        jobType: 'full-time',
        status: 'declined',
        createdAt: '2026-05-30'
    },
    {
        _id: '10',
        position: 'Mobile Developer',
        company: 'LinkedIn',
        jobLocation: 'Mountain View, CA',
        jobType: 'full-time',
        status: 'pending',
        createdAt: '2026-06-16'
    },
    {
        _id: '11',
        position: 'Cloud Architect',
        company: 'IBM',
        jobLocation: 'Remote',
        jobType: 'full-time',
        status: 'interview',
        createdAt: '2026-06-14'
    },
    {
        _id: '12',
        position: 'Security Engineer',
        company: 'Cisco',
        jobLocation: 'San Jose, CA',
        jobType: 'full-time',
        status: 'pending',
        createdAt: '2026-06-09'
    },
    {
        _id: '13',
        position: 'Machine Learning Engineer',
        company: 'OpenAI',
        jobLocation: 'Remote',
        jobType: 'full-time',
        status: 'interview',
        createdAt: '2026-06-11'
    },
    {
        _id: '14',
        position: 'Systems Administrator',
        company: 'Adobe',
        jobLocation: 'San Jose, CA',
        jobType: 'full-time',
        status: 'declined',
        createdAt: '2026-05-25'
    },
    {
        _id: '15',
        position: 'Database Admin',
        company: 'Oracle',
        jobLocation: 'Austin, TX',
        jobType: 'full-time',
        status: 'pending',
        createdAt: '2026-06-13'
    },
    {
        _id: '16',
        position: 'Solutions Architect',
        company: 'Salesforce',
        jobLocation: 'San Francisco, CA',
        jobType: 'full-time',
        status: 'pending',
        createdAt: '2026-06-17'
    },
    {
        _id: '17',
        position: 'DevOps Specialist',
        company: 'Stripe',
        jobLocation: 'Remote',
        jobType: 'remote',
        status: 'interview',
        createdAt: '2026-06-07'
    },
    {
        _id: '18',
        position: 'Intern - Web Development',
        company: 'GitHub',
        jobLocation: 'Remote',
        jobType: 'internship',
        status: 'pending',
        createdAt: '2026-06-19'
    }
];

const MOCK_STATS = {
    defaultStats: {
        pending: 11,
        interview: 6,
        declined: 3
    },
    monthlyApplications: [
        { date: 'May 2026', count: 3 },
        { date: 'Jun 2026', count: 15 }
    ]
};

export const getAllJobs = createAsyncThunk('allJobs/getJobs', async (_, thunkAPI) => {

    const {page, search, searchStatus, sort, searchType} = thunkAPI.getState().allJobs;
    const userToken = thunkAPI.getState().user.user?.token;

    // Return mock data for test user
    if (userToken === 'mock-token-12345') {
        let filteredJobs = [...MOCK_JOBS];
        
        if (searchStatus !== 'all') {
            filteredJobs = filteredJobs.filter(job => job.status === searchStatus);
        }
        if (searchType !== 'all') {
            filteredJobs = filteredJobs.filter(job => job.jobType === searchType);
        }
        if (search) {
            filteredJobs = filteredJobs.filter(job => 
                job.position.toLowerCase().includes(search.toLowerCase()) ||
                job.company.toLowerCase().includes(search.toLowerCase())
            );
        }

        return {
            jobs: filteredJobs,
            totalJobs: filteredJobs.length,
            numOfPages: 1
        };
    }

    const url = `/jobs?status=${searchStatus}&jobType=${searchType}&sort=${sort}&page=${page}`;

    if(search){
        url = url + `&search=${search}`;
    }

    try {
         const response = await customFetch.get(url, {
            headers : {
                authorization : `Bearer ${userToken}`,
            }
         });

         return response.data;

    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.msg);
    }
});

export const showStats = createAsyncThunk('allJobs/showStats', async(_, thunkAPI) => {
    const userToken = thunkAPI.getState().user.user?.token;

    // Return mock stats for test user
    if (userToken === 'mock-token-12345') {
        return MOCK_STATS;
    }

    try {
        const response  = await customFetch.get('/jobs/stats', {
            headers : {
                authorization : `Bearer ${userToken}`,
            }
        })
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.msg);
    }
});


const allJobsSlice = createSlice({
    name : 'allJobs',
    initialState,
    reducers : {
       showLoading : (state) => {
        state.isLoading = true;
       },
       hideLoading : (state) => {
        state.isLoading = false;
       },
       handleChange : (state, {payload : {name, value}}) => {
        state.page = 1;
        state[name] = value;
       },
       clearFilters : (state) => {
        return {...state, ...initialFilterState};
       },
       changePage : (state,{payload}) => {
           state.page = payload;
       },
       clearAllJobsState : (state) => initialState,
    },
    // extraReducers : {
    //     [getAllJobs.pending] : (state) => {
    //         state.isLoading = true;
    //     },
    //     [getAllJobs.fulfilled] : (state, {payload}) => {
    //         state.isLoading = false;
    //         state.jobs = payload.jobs;
    //         state.numOfPages = payload.numOfPages;
    //         state.totalJobs = payload.totalJobs;
    //     },
    //     [getAllJobs.rejected] : (state, {payload}) => {
    //         state.isLoading = false;
    //         toast.error(payload);
    //     },
    //     [showStats.pending] : (state) => {
    //         state.isLoading = true;
    //     },
    //     [showStats.fulfilled] : (state, {payload}) => {
    //         state.isLoading = false;
    //         state.stats = payload.defaultStats;
    //         state.monthlyApplications = payload.monthlyApplications;
    //     },
    //     [showStats.rejected] : (state, {payload}) => {
    //         state.isLoading = false;
    //         toast.error(payload);
    //     },

    // }
    extraReducers : (builder) => {
        builder.addCase(getAllJobs.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(getAllJobs.fulfilled, (state, {payload}) => {
            state.isLoading = false;
            state.jobs = payload.jobs;
            state.numOfPages = payload.numOfPages;
            state.totalJobs = payload.totalJobs;
        })
        .addCase(getAllJobs.rejected, (state, {payload}) => {
            state.isLoading = false;
            toast.error(payload);
        })
        .addCase(showStats.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(showStats.fulfilled, (state, {payload}) => {
            state.isLoading = false;
            state.stats = payload.defaultStats;
            state.monthlyApplications = payload.monthlyApplications;
        })
        .addCase(showStats.rejected, (state, {payload}) => {
            state.isLoading = false;
            toast.error(payload);
        })
    
    }
});


export const {showLoading,hideLoading, handleChange, clearFilters, changePage, clearAllJobsState} = allJobsSlice.actions;
export default allJobsSlice.reducer;

// extraReducers : (builder) => {
//     builder.addCase(getAllJobs.pending, (state) => {
//         state.isLoading = true;
//     })
//     builder.addCase(getAllJobs.fulfilled, (state, {payload}) => {
//         state.isLoading = false;
//         state.jobs = payload.jobs;
//         state.numOfPages = payload.numOfPages;
//         state.totalJobs = payload.totalJobs;
//     })
//     builder.addCase(getAllJobs.rejected, (state, {payload}) => {
//         state.isLoading = false;
//         toast.error(payload);
//     })
//     builder.addCase(showStats.pending, (state) => {
//         state.isLoading = true;
//     })
//     builder.addCase(showStats.fulfilled, (state, {payload}) => {
//         state.isLoading = false;
//         state.stats = payload.defaultStats;
//         state.monthlyApplications = payload.monthlyApplications;
//     })
//     builder.addCase(showStats.rejected, (state, {payload}) => {
//         state.isLoading = false;
//         toast.error(payload);
//     })

// }