import { FC, useEffect, useState } from "react"



const ClientOnly: FC<any> = ({children}) => {
    const [isMounted, setIsMounted] = useState(false)
    
    useEffect(() => setIsMounted(true), [])

    if(!isMounted) {
        return null
    }else{
        return <>{children}</>
    }
}

export default ClientOnly