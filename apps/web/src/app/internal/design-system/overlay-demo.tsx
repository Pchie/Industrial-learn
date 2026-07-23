"use client";

import { useState } from "react";
import { Button, Drawer, Modal } from "@industrial-learn/design-system";

export function OverlayDemo() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setModalOpen(true)}>Open modal example</Button>
      <Button onClick={() => setDrawerOpen(true)} variant="secondary">
        Open drawer example
      </Button>
      <Modal onDismiss={() => setModalOpen(false)} open={modalOpen} title="Modal example">
        <p>Modal content stays scoped and labelled.</p>
        <Button onClick={() => setModalOpen(false)}>Close modal</Button>
      </Modal>
      <Drawer
        onDismiss={() => setDrawerOpen(false)}
        open={drawerOpen}
        title="Drawer example"
      >
        <p>Drawer content supports secondary workflows.</p>
        <Button onClick={() => setDrawerOpen(false)}>Close drawer</Button>
      </Drawer>
    </>
  );
}
