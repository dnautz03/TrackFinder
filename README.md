# TrackFinder

Type a DJ's name and a period. TrackFinder finds their sets on 1001Tracklists and gives you
every track they played, without IDs, unreleased tracks or duplicates. You can save the list
as a `.txt` file, and each track has Spotify / SoundCloud shortcuts so you can listen to it.

Free desktop app for **Windows** and **macOS**.

---

## Download

Go to **[Releases](../../releases/latest)** and download the file for your computer:

| Computer | File | Needs |
|---|---|---|
| Windows | **[TrackFinder-Windows.zip](../../releases/latest/download/TrackFinder-Windows.zip)** | Windows 10 (1809 or newer) or Windows 11 |
| Mac | **[TrackFinder-macOS.zip](../../releases/latest/download/TrackFinder-macOS.zip)** | macOS 14 Sonoma or newer, Apple Silicon (M1–M4) or Intel |

---

## Windows

1. Right-click `TrackFinder-Windows.zip` → **Extract All** → **Extract**.
2. Open the `TrackFinder` folder and double-click **TrackFinder.exe**. Nothing else to install.
3. The first time, Windows may show **"Windows protected your PC"**.
   Click **More info** → **Run anyway**. You only need to do this once.

Tip: right-click `TrackFinder.exe` → **Send to** → **Desktop (create shortcut)**.

---

## Mac

1. Double-click `TrackFinder-macOS.zip`. You get **TrackFinder.app**.
2. Drag **TrackFinder.app** into your **Applications** folder.
3. Double-click TrackFinder.

### "Apple could not verify TrackFinder is free of malware"

**This message is expected.** macOS shows it for every app that isn't registered with Apple
(registration costs $99/year, and TrackFinder is a free app). It does not mean the app
is harmful. To open it, do this **once**:

1. In the warning, click **Done** (not "Move to Trash").
2. Open **System Settings** → **Privacy & Security**.
3. Scroll down. Next to *"TrackFinder" was blocked…*, click **Open Anyway**.
4. Confirm with **Open Anyway** and your Mac password (or Touch ID).

From then on TrackFinder opens normally with a double click.

<details>
<summary>It says the app "is damaged and can't be opened"</summary>

Open the **Terminal** app, paste this line, press Enter, then open TrackFinder again:

```
xattr -dr com.apple.quarantine /Applications/TrackFinder.app
```
</details>

### First start on Mac

TrackFinder tells you it needs to download its components (Python and the window
libraries): about **0.5 GB** to download, **1.5 GB** on disk. It asks before doing anything.
Click **Install** and wait a few minutes; the app then opens by itself. This happens only once,
needs no administrator password and changes nothing else on your Mac.

---

## How to use it

1. Type the artist's name and pick a period (quick buttons or **Custom** for exact dates).
2. Click **Find tracks**.
3. Sometimes 1001Tracklists asks you to prove you are human. A small window opens:
   answer the check there and TrackFinder carries on by itself.
4. Look through the sets, listen with the Spotify / SoundCloud icons, then click
   **Save list** to get a `.txt` with one *Artist – Title* per line.

Turn on **Include IDs and unreleased** on the first page if you want those too.

---

## Good to know

- TrackFinder reads the public pages of 1001Tracklists slowly (one page every 8 seconds,
  as the site asks), so a long period can take a few minutes. Pages are cached, so running
  the same search again is fast.
- "ID" / "unreleased" are filtered using the markings in the tracklists. This does **not**
  check whether a track has officially been released.
- The Spotify / SoundCloud icons appear only when the tracklist links the track there.
  They open a search on that platform.
- TrackFinder is not affiliated with 1001Tracklists, Spotify or SoundCloud.

---

## License

Free to download and use. The app and its code are not open source: see [LICENSE](LICENSE).
