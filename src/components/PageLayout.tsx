import { Container, Stack } from "@mui/material";
import type { PropsWithChildren } from "react";

export default function PageLayout({ children }: PropsWithChildren) {
  return (
    <Container sx={{ py: 3 }}>
      <Stack gap={3}>{children}</Stack>
    </Container>
  );
}
