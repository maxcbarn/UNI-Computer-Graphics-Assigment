# Little World — University Computer Graphics Assignment

**Little World** is a procedural planet project developed for a university Computer Graphics course.  
The objective of the assignment was to generate a 3D world using a lathe-based mesh, apply procedural terrain generation, implement animation and lighting with shadows, and support object picking through mouse interaction.

---

## 🌍 Terrain Generation

The planet geometry is created using a **lathe operation**, where a 2D profile curve is rotated around an axis to form a spherical surface.

Terrain deformation is achieved using **Perlin noise**, applied **four times** with different parameters (hash, amplitude, and frequency).  
By combining multiple noise layers, the system is able to generate a wide range of terrain features such as mountains, hills, and plains.

---

## 🌫️ Animation System

A simple animation system is used to rotate the **cloud layer** around the planet, adding motion and visual depth to the scene.

---

## ☀️ Lighting & Shadows

The scene includes a **directional light acting as a sun**, which continuously rotates around the **Y axis**.

Shadow mapping is implemented so that objects correctly cast shadows onto the planet’s surface, improving realism and spatial perception.

---

## 🌲 Object Picking

An object picking system allows the user to **click on the planet’s surface**.  
The clicked position is computed in world space, and a **tree object is instantiated at that location**, following the curvature of the planet.

---

## 🔗 Live Demo

👉 **Hosted version:**  
[https://maxcbarn.github.io/UNI-Computer-Graphics-Assigment/](https://maxcbarn.github.io/UNI-Computer-Graphics-Assigment/)

> ⚠️ If running locally, a **live server** is required, as the project depends on externally hosted JavaScript files.

---

## 🎮 Controls

| Input | Action |
|------|--------|
| **Left Mouse Click** | Place trees on the planet |
| **Q / E** | Zoom in / Zoom out |
| **W / A / S / D** | Pan the camera around the planet |

---

## 🎛️ Sliders & Parameters

| Slider | Description |
|------|-------------|
| **Radius** | Changes the base radius of the planet |
| **Points Per Curve** | Number of points per lathe profile rotation |
| **Divisions** | Number of rotational steps in the lathe process |
| **Hash 1–4** | Seed values for each Perlin noise layer |
| **Amplitude 1–4** | Strength multiplier for each noise layer |
| **Frequency 1–4** | Frequency of the Perlin noise gradients |

---
