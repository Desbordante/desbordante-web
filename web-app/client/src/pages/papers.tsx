import { GetServerSideProps, NextPage } from 'next';
import HomeBackground from '@assets/backgrounds/home.svg?component';
import PrPublicationCard from '@components/PrPublicationCard';
import SciencePublicationCard from '@components/SciencePublicationCard';
import cmsClient from '@graphql/cmsClient';
import { getPublications } from '@graphql/operations/queries/__generated__/getPublications';
import { GET_PUBLICATIONS } from '@graphql/operations/queries/getPublications';
import styles from '@styles/Papers.module.scss';

interface Props {
  papers: getPublications;
}

const Papers: NextPage<Props> = ({ papers }) => {
  const prPublications = papers?.prPublications?.data;
  const sciencePublications = papers?.sciencePublications?.data;

  return (
    <div className={styles.papersPage}>
      <HomeBackground
        className={styles.background}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      />

      {prPublications && prPublications.length > 0 && (
        <section className={styles.prPublications}>
          <h5 className={styles.sectionTitle}>Press</h5>
          <ol className={styles.papersContainer}>
            {prPublications.map(
              ({ id, attributes }) =>
                attributes && <PrPublicationCard key={id} data={attributes} />,
            )}
          </ol>
        </section>
      )}

      {sciencePublications && sciencePublications.length > 0 && (
        <section className={styles.sciencePublications}>
          <h5 className={styles.sectionTitle}>Publications</h5>
          <ol className={styles.papersContainer}>
            {sciencePublications.map(
              ({ id, attributes }) =>
                attributes && (
                  <SciencePublicationCard key={id} data={attributes} />
                ),
            )}
          </ol>
        </section>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const { data } = await cmsClient.query<getPublications>({
    query: GET_PUBLICATIONS,
  });

  return {
    props: {
      papers: data,
    },
  };
};

export default Papers;
