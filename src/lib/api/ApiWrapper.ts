const API_KEY = import.meta.env.VITE_TMDB_API_KEY  //import.meta.env 是 Vite 在 import.meta 对象上添加的 env 属性
export const BASE_URL = "https://api.themoviedb.org/3"

// Generic Api Wrapper
/**
 *  泛型：
 *  - <T>: 由调用者在调用函数时指定，表示期望 TMDB 返回的具体数据结构类型
 *         例如：tmdbFetch<MovieDetail>('movie/123', {}, fetch)
 *         此时 <T> = MovieDetail，使返回值类型自动推断为 Promise<MovieDetail | null>
 * 
 * 参数：
 *  @param endpoint - TMDB API 的具体接口路径（例如 "movie/12345"）
 *  @param params - 可选，额外的 query 参数对象（将会自动拼接到 URL 上）
 *  @param fetchFn - 注入的 fetch 函数（通常传入全局 fetch，可用于测试时 mock）
 * 
 * 返回：
 *  - Promise<T | null>
 *    返回值为解析后的 TMDB JSON 响应（类型为调用时指定的 T），如果请求失败则返回 null。
*/
export async function tmdbFetch<T>(
    endpoint: string,
    params: Record<string, any> = {},
    fetchFn: typeof fetch
): Promise<T | null> {
    // 创建 URL 实例，安全拼接 BASE_URL 和 endpoint,遍历额外参数，将其全部追加到 URL 的 query 中 ==(开始)
    const url = new URL(`${BASE_URL}/${endpoint}`)

    url.searchParams.append('api_key', API_KEY)

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value.toString())
    })
    // 创建 URL 实例，安全拼接 BASE_URL 和 endpoint,遍历额外参数，将其全部追加到 URL 的 query 中 ==(结束)
    // console.log(url)
    // 正确则返回,错误则报错
    try {
        const response = await fetchFn(url.toString())

        if (!response.ok) {
            console.log((`HTTP error! status: ${response.status}`));
            return null;
        }

        const data: T = await response.json();
        return data;
    } catch (error) {
        console.log('TMDB Error', error);
        return null;
    }
}