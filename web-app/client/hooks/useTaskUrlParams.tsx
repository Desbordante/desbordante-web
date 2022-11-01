import { useRouter } from "next/router";

export const useTaskUrlParams = () => {
  const router = useRouter();
  const primitive = router.query.primitive || "FD";
  const fileID = router.query.fileID;
  return { primitive, fileID };
};
