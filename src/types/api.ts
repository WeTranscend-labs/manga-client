export interface BaseResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export const responseDefault: BaseResponse = {
  success: false,
};
