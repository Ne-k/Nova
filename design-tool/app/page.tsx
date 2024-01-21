import Image from 'next/image'
import Home from './pages/index'
import {useRouter} from "next/router";

export default function Page() {
  const router = useRouter()
  return (
      <Home/>
  )
}
