import { GetServerSideProps, NextPage } from 'next';
import tabs from 'src/routes/UserCabinet/tabs';

const UserCabinet: NextPage = () => {
  return null;
};

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: `/me/${tabs[0].pathname}`,
      permanent: true,
    },
  };
};

export default UserCabinet;
