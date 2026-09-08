"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  MoveLeft,
  MoveRight,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { Alert } from "@industrial-learn/design-system";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  AnatomyOverlay,
  cylinderInspectionSource,
  cylinderParts,
  type CylinderPart,
  type HydraulicInspectionState
} from "./hydraulic-inspection";
import styles from "./views.module.css";

type CameraCommand =
  "left" | "right" | "up" | "down" | "in" | "out" | "panLeft" | "panRight" | "reset";
type SceneController = {
  command: (command: CameraCommand) => void;
  update: (state: HydraulicInspectionState, selected: CylinderPart) => void;
};

export function ThreeCylinderView(props: HydraulicInspectionState) {
  const container = useRef<HTMLDivElement>(null);
  const controller = useRef<SceneController | null>(null);
  const [failure, setFailure] = useState(false);
  const [selected, setSelected] = useState<CylinderPart>("Piston");
  const [cameraState, setCameraState] = useState("Initial perspective");
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setFailure(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.setAttribute(
      "aria-label",
      "Three-dimensional cutaway cylinder. Use the camera controls and part list to inspect it."
    );
    renderer.domElement.setAttribute("role", "img");
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    camera.position.set(5, 3.5, 7);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.35, 0, 0);
    controls.minDistance = 4;
    controls.maxDistance = 18;
    controls.enableDamping = false;
    controls.update();
    controls.saveState();
    scene.add(new THREE.HemisphereLight(0xffffff, 0xffffff, 2.1));
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(2, 5, 6);
    scene.add(light);
    const rig = new THREE.Group();
    scene.add(rig);
    const meshes: {
      mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
      part: CylinderPart;
      token: string;
    }[] = [];
    function add(
      geometry: THREE.BufferGeometry,
      x: number,
      part: CylinderPart,
      token: string,
      opacity = 1
    ) {
      const material = new THREE.MeshStandardMaterial({
        roughness: 0.4,
        metalness: part === "Chambers" ? 0 : 0.45,
        transparent: opacity < 1,
        opacity,
        side: THREE.DoubleSide,
        depthWrite: opacity === 1
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = x;
      mesh.rotation.z = Math.PI / 2;
      rig.add(mesh);
      meshes.push({ mesh, part, token });
      return mesh;
    }
    add(
      new THREE.CylinderGeometry(0.88, 0.88, 4.6, 48, 1, true, 0, Math.PI * 1.35),
      -0.5,
      "Barrel",
      "--il-material-metal-mid",
      0.55
    );
    add(
      new THREE.CylinderGeometry(0.96, 0.96, 0.26, 48),
      -2.8,
      "End caps",
      "--il-material-metal-dark"
    );
    add(
      new THREE.CylinderGeometry(0.96, 0.96, 0.28, 48),
      1.8,
      "End caps",
      "--il-material-metal-dark"
    );
    add(
      new THREE.CylinderGeometry(0.8, 0.8, 0.28, 48),
      -0.2,
      "Piston",
      "--il-material-metal-mid"
    );
    add(
      new THREE.CylinderGeometry(0.25, 0.25, 4, 48),
      1.85,
      "Rod",
      "--il-material-metal-light"
    );
    add(
      new THREE.CylinderGeometry(0.76, 0.76, 2.4, 48),
      -1.55,
      "Chambers",
      "--il-color-domain-hydraulic",
      0.3
    );
    for (const x of [-0.3, -0.08, 1.97]) {
      const ring = add(
        new THREE.TorusGeometry(x > 1 ? 0.28 : 0.81, 0.045, 10, 48),
        x,
        "Seals",
        "--il-material-seal"
      );
      ring.rotation.set(0, Math.PI / 2, 0);
    }
    const probe = document.createElement("span");
    probe.hidden = true;
    host.appendChild(probe);
    function colour(token: string) {
      probe.style.color = `var(${token})`;
      return new THREE.Color(getComputedStyle(probe).color);
    }
    const render = () => renderer.render(scene, camera);
    let current: HydraulicInspectionState = {
      pressureMPa: 0,
      forceKN: 0,
      diameterRatio: 0
    };
    let selectedPart: CylinderPart = "Piston";
    function update(state: HydraulicInspectionState, part: CylinderPart) {
      current = state;
      selectedPart = part;
      rig.scale.set(
        1,
        0.8 + Math.min(1, Math.max(0, state.diameterRatio)) * 0.35,
        0.8 + Math.min(1, Math.max(0, state.diameterRatio)) * 0.35
      );
      scene.background = colour("--il-color-bg-muted");
      for (const entry of meshes) {
        entry.mesh.material.color.copy(
          colour(entry.part === part ? "--il-color-accent" : entry.token)
        );
        if (entry.part === "Chambers")
          entry.mesh.material.opacity = state.pressureMPa > 0 ? 0.32 : 0.07;
      }
      render();
    }
    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      // Preserve horizontal framing when the canvas becomes portrait-shaped.
      camera.fov = THREE.MathUtils.radToDeg(
        2 *
          Math.atan(
            Math.tan(THREE.MathUtils.degToRad(34) / 2) / Math.min(1, camera.aspect / 1.6)
          )
      );
      camera.updateProjectionMatrix();
      render();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    const themeObserver = new MutationObserver(() => update(current, selectedPart));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const recolour = () => update(current, selectedPart);
    systemTheme.addEventListener("change", recolour);
    controls.addEventListener("change", render);
    const lost = (event: Event) => {
      event.preventDefault();
      setFailure(true);
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    controller.current = {
      update,
      command(command) {
        if (command === "reset") controls.reset();
        else if (command === "left" || command === "right")
          controls.rotateLeft(command === "left" ? 0.25 : -0.25);
        else if (command === "up" || command === "down")
          controls.rotateUp(command === "up" ? 0.2 : -0.2);
        else if (command === "in" || command === "out") {
          if (command === "in") controls.dollyIn(0.85);
          else controls.dollyOut(0.85);
        } else controls.pan(command === "panLeft" ? 20 : -20, 0);
        controls.update();
        render();
      }
    };
    return () => {
      controller.current = null;
      observer.disconnect();
      themeObserver.disconnect();
      systemTheme.removeEventListener("change", recolour);
      controls.removeEventListener("change", render);
      controls.dispose();
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      for (const { mesh } of meshes) {
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      probe.remove();
    };
  }, []);
  useEffect(() => {
    controller.current?.update(props, selected);
  }, [props, selected]);
  const command = (value: CameraCommand) => {
    controller.current?.command(value);
    setCameraState(
      value === "reset" ? "Initial perspective" : `Camera adjusted: ${value}`
    );
  };
  if (failure)
    return (
      <>
        <Alert title="WebGL unavailable" tone="warning">
          Continue with the accessible cutaway view.
        </Alert>
        <AnatomyOverlay {...props} />
      </>
    );
  const buttons = [
    ["left", "Rotate left", ArrowLeft],
    ["right", "Rotate right", ArrowRight],
    ["up", "Rotate up", ArrowUp],
    ["down", "Rotate down", ArrowDown],
    ["in", "Zoom in", ZoomIn],
    ["out", "Zoom out", ZoomOut],
    ["panLeft", "Pan left", MoveLeft],
    ["panRight", "Pan right", MoveRight],
    ["reset", "Reset camera", RotateCcw]
  ] as const;
  return (
    <div className={styles.inspection}>
      <div className={styles.scene3d} ref={container} />
      <div className={styles.controls} role="group" aria-label="3D camera controls">
        {buttons.map(([value, label, Icon]) => (
          <button
            className="il-icon-button"
            type="button"
            key={value}
            aria-label={label}
            title={label}
            onClick={() => command(value)}
          >
            <Icon aria-hidden="true" size={20} />
          </button>
        ))}
      </div>
      <div className={styles.parts} role="group" aria-label="3D cylinder parts">
        {cylinderParts.map((part) => (
          <button
            type="button"
            key={part}
            aria-pressed={selected === part}
            onClick={() => setSelected(part)}
          >
            {part}
          </button>
        ))}
      </div>
      <p className={styles.caption} role="status">
        {cameraState}. Selected: {selected}. Pressure: {props.pressureMPa.toFixed(1)} MPa.
        Ideal force: {props.forceKN.toFixed(2)} kN.
      </p>
      <p className={styles.boundary}>
        Original cutaway assembly; illustrative proportions, not a manufacturer model. No
        seal specification, flow, velocity or rod-side calculation. Source:{" "}
        {cylinderInspectionSource}. Engineering review required.
      </p>
    </div>
  );
}
