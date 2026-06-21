import { ServiceUnavailableException } from "@nestjs/common";
import axios from "axios";

export interface DefaultExceptionWrapperParams {
    message?: string;
}

export async function defaultExceptionWrapper<T>(fun: () => (T | Promise<T>), params: DefaultExceptionWrapperParams) {
   try {
        return await fun();
    } catch (err: unknown) {
        if (
            axios.isAxiosError(err) && (err.code === 'ECONNREFUSED' || !err.response)
            || err instanceof ServiceUnavailableException 
        ) { 
            throw new ServiceUnavailableException(params.message);
        }
        throw err;
    }
}