import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface TestCategory {
    _id: string;
    name: string;
    description: string;
}

interface TestSeries {
    _id: string;
    categoryId: string;
    title: string;
    description: string;
    price: number;
    isPaid: boolean;
}

interface Test {
    _id: string;
    seriesId: string;
    title: string;
    description: string;
    durationMinutes: number;
    totalMarks: number;
}

interface Question {
    _id: string;
    testId: string;
    type: "mcq" | "subjective" | "true_false" | "numerical" | "file_upload";
    text: string;
    mediaUrl?: string;
    mediaType?: "image" | "audio" | "video";
    options?: { optionId: string; text: string; isCorrect: boolean }[];
    marks: number;
    negativeMarks: number;
}

interface TestSeriesState {
    categories: TestCategory[];
    series: TestSeries[];
    tests: Test[];
    questions: Question[];
    loading: boolean;
    error: string | null;
}

const initialState: TestSeriesState = {
    categories: [],
    series: [],
    tests: [],
    questions: [],
    loading: false,
    error: null,
};

// CATEGORIES
export const fetchCategories = createAsyncThunk("testSeries/fetchCategories", async () => {
    const response = await axiosInstance.get("/test-series/categories");
    return response.data;
});

export const createCategory = createAsyncThunk("testSeries/createCategory", async (data: any) => {
    const response = await axiosInstance.post("/test-series/categories", data);
    return response.data;
});

// SERIES
export const fetchSeriesByCategory = createAsyncThunk("testSeries/fetchSeriesByCategory", async (categoryId: string) => {
    const response = await axiosInstance.get(`/test-series/series/${categoryId}`);
    return response.data;
});

export const createSeries = createAsyncThunk("testSeries/createSeries", async (data: any) => {
    const response = await axiosInstance.post("/test-series/series", data);
    return response.data;
});

// TESTS
export const fetchTestsBySeries = createAsyncThunk("testSeries/fetchTestsBySeries", async (seriesId: string) => {
    const response = await axiosInstance.get(`/test-series/tests/${seriesId}`);
    return response.data;
});

export const createTest = createAsyncThunk("testSeries/createTest", async (data: any) => {
    const response = await axiosInstance.post("/test-series/tests", data);
    return response.data;
});

// QUESTIONS
export const createQuestion = createAsyncThunk("testSeries/createQuestion", async (data: any) => {
    const response = await axiosInstance.post("/test-series/questions", data);
    return response.data;
});

const testSeriesSlice = createSlice({
    name: "testSeries",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Categories
            .addCase(fetchCategories.pending, (state) => { state.loading = true; })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload?.data || action.payload || [];
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch categories";
            })
            // Series
            .addCase(fetchSeriesByCategory.fulfilled, (state, action) => {
                state.series = action.payload?.data || action.payload || [];
            })
            // Tests
            .addCase(fetchTestsBySeries.fulfilled, (state, action) => {
                state.tests = action.payload?.data || action.payload || [];
            });
    },
});

export default testSeriesSlice.reducer;
