import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import { Container, Stack } from "@mui/material";

export default function IndexPage() {
  return (
    <Container sx={{ py: 2 }}>
      <Stack gap={3}>
        <PageHeader
          pageTitle="Custom Attributes Vision"
          pageSubtitle="Prototype deployed via VibeSharing"
        />
      </Stack>
    </Container>
  );
}
