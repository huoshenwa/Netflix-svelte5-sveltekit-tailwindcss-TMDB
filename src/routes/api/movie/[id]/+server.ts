import { getMovieById } from "$lib/api/API";
import type { RequestHandler } from "@sveltejs/kit";


export const GET:RequestHandler = async({params,fetch})=>{
    const {id} = params

    if(!id){
        return new Response(JSON.stringify({error:"No Movie ID provided"}),{
            status:400,
            headers:{
                'content-type': 'application/json'
            }
        })
    }

    try {
        const movieDetails = await getMovieById(fetch,id)
        return new Response(JSON.stringify({movieDetails}),{
            status:200,
            headers:{
                'content-type': 'application/json'
            }
        })
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message}),{
            status:500,
            headers:{
                'content-type': 'application/json'
            }
        })
    }
}