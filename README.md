<p align="center">
  <h1 align="center">TrackFinder</h1>
  <p align="center"><b>Every track your favorite DJ played, in one click.</b></p>
  <p align="center">
    Type a DJ's name and a period. TrackFinder finds their sets on 1001Tracklists and gives you
    every track they played, without IDs, unreleased tracks or duplicates.
  </p>
</p>

<p align="center">
  <a href="../../releases/latest"><img src="https://img.shields.io/github/v/release/dnautz03/TrackFinder?label=latest%20version&color=blue" alt="Latest release"></a>
  <a href="../../releases"><img src="https://img.shields.io/github/downloads/dnautz03/TrackFinder/total?color=brightgreen" alt="Downloads"></a>
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey" alt="Windows | macOS">
  <img src="https://img.shields.io/badge/price-free-success" alt="Free">
</p>

<p align="center">
  <a href="../../releases/latest/download/TrackFinder-Windows.zip"><img src="https://img.shields.io/badge/Download%20for-Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Download for Windows"></a>
  &nbsp;
  <a href="../../releases/latest/download/TrackFinder-macOS.zip"><img src="https://img.shields.io/badge/Download%20for-macOS-000000?style=for-the-badge&logo=apple&logoColor=white" alt="Download for macOS"></a>
</p>

<!--
  DEMO GIF: record max 10 seconds:
  type a DJ name → pick a period → click "Find tracks" → tracklist appears → click "Save list".
  Save it as docs/demo.gif (tools: ScreenToGif on Windows, Kap on Mac).
-->
<p align="center">
  <img src="docs/demo.gif" alt="TrackFinder demo" width="720">
</p>

---

## What it does

- **Finds a DJ's sets** on 1001Tracklists for any period you choose
- **Cleans the list**: no IDs, no unreleased tracks, no duplicates
- **Listen right away** with Spotify / SoundCloud shortcuts
- **Save the list** as a `.txt` file, one *Artist – Title* per line
- **Fast repeat searches**: pages are cached

---

## How it works

1. **Type** the artist's name and pick a period (quick buttons or **Custom** for exact dates).
2. **Click** **Find tracks**.
3. **Listen and save**: browse the sets, play tracks with the Spotify / SoundCloud icons,
   then click **Save list**.

> [!TIP]
> Want IDs and unreleased tracks too? Turn on **Include IDs and unreleased** on the first page.

> [!NOTE]
> Sometimes 1001Tracklists asks you to prove you are human. A small window opens:
> answer the check there and TrackFinder carries on by itself.

---

## Download

| Computer | File | Needs |
|---|---|---|
| Windows | **[TrackFinder-Windows.zip](../../releases/latest/download/TrackFinder-Windows.zip)** | Windows 10 (1809 or newer) or Windows 11 |
| Mac | **[TrackFinder-macOS.zip](../../releases/latest/download/TrackFinder-macOS.zip)** | macOS 14 Sonoma or newer, Apple Silicon (M1–M4) or Intel |

All versions are on the **[Releases](../../releases/latest)** page.

---

## Install on Windows

1. Right-click `TrackFinder-Windows.zip` → **Extract All** → **Extract**.
2. Open the `TrackFinder` folder and double-click **TrackFinder.exe**. Nothing else to install.

> [!WARNING]
> **"Windows protected your PC"?** This is expected the first time.
> Click **More info** → **Run anyway**. You only need to do this once.

Tip: right-click `TrackFinder.exe` → **Send to** → **Desktop (create shortcut)**.

---

## Install on Mac

1. Double-click `TrackFinder-macOS.zip`. You get **TrackFinder.app**.
2. Drag **TrackFinder.app** into your **Applications** folder.
3. Double-click TrackFinder.

> [!WARNING]
> **"Apple could not verify TrackFinder is free of malware"?** This message is expected.
> macOS shows it for every app that isn't registered with Apple (registration costs $99/year,
> and TrackFinder is a free app). It does not mean the app is harmful.

To open it, do this **once**:

1. In the warning, click **Done** (not "Move to Trash").
2. Open **System Settings** → **Privacy & Security**.
3. Scroll down. Next to *"TrackFinder" was blocked…*, click **Open Anyway**.
4. Confirm with **Open Anyway** and your Mac password (or Touch ID).

From then on TrackFinder opens normally with a double click.

<details>
<summary><b>It says the app "is damaged and can't be opened"</b></summary>

<br>

Open the **Terminal** app, paste this line, press Enter, then open TrackFinder again:

```
xattr -dr com.apple.quarantine /Applications/TrackFinder.app
```
</details>

> [!NOTE]
> **First start on Mac:** TrackFinder needs to download its components (Python and the window
> libraries): about **0.5 GB** to download, **1.5 GB** on disk. It asks before doing anything.
> Click **Install** and wait a few minutes; the app then opens by itself.
> This happens only once, needs no administrator password and changes nothing else on your Mac.

---

## Good to know

<details>
<summary><b>Why does a search take a few minutes?</b></summary>

<br>

TrackFinder reads the public pages of 1001Tracklists slowly (one page every 8 seconds, as the
site asks), so a long period can take a few minutes. Pages are cached, so running the same
search again is fast.
</details>

<details>
<summary><b>How are IDs and unreleased tracks filtered?</b></summary>

<br>

They are filtered using the markings in the tracklists. This does **not** check whether a
track has officially been released.
</details>

<details>
<summary><b>Why don't some tracks have Spotify / SoundCloud icons?</b></summary>

<br>

The icons appear only when the tracklist links the track there. They open a search on that
platform.
</details>

---

## ⭐ Like it?

If TrackFinder saved you time, a ⭐ on this repo helps other DJs find it.

Found a bug or have an idea? **[Open an issue](../../issues)**.

---

## Disclaimer & License

TrackFinder is not affiliated with 1001Tracklists, Spotify or SoundCloud.

Free to download and use. The app and its code are not open source: see [LICENSE](LICENSE).
