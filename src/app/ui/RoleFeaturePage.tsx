interface RoleFeaturePageProps {
  title: string;
  description: string;
}

export const RoleFeaturePage = ({ title, description }: RoleFeaturePageProps) => {
  return (
    <main className="status-page">
      <h1>{title}</h1>
      <p>{description}</p>
    </main>
  );
};