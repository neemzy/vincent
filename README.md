# Vincent

![Vincent McDoom](https://raw.githubusercontent.com/neemzy/vincent/refs/heads/main/vmd.jpg)

**Vincent is a straightforward, opinionated little app that helps you run and play Doom.**

Your average Doom player typically has multiple source ports installed and too many WADs to keep track of.  
Like many Doom launchers before it, Vincent lets you quickly pick a source port, IWAD, PWADs and settings and run the game with those at the press of a button, but it can also do the following:

- **detect your WADs' respective feature sets (vanilla, Boom, MBF, MBF21 or ID24)** and other data, and **autoselect settings accordingly** for any one of them
- **download, unzip and add new WADs** to your collection from an /idgames URL

## Installation

You will need [Node.js](https://nodejs.org/) to install and run Vincent:

```sh
$ git clone git@github.com:neemzy/vincent.git
$ cd vincent
$ npm install
```

## Configuration

**TL;DR: `cp config.example.json config.json` and edit the latter to suit your needs.**

Create a `config.json` file with the following contents:

```json
{
  "httpPort": 8666,
  "wadDir": "/path/to/your/wads",

  "ports": {
  },

  "profiles": [
  ]
}
```

### WAD folder

Vincent expects `wadDir` to point to a folder containing **all** your WAD (or PK3) files, without subfolders.  
**Both IWADs and PWADs will be looked for there**.

The following IWADs (and official PWADs) are supported:

| Description             | Expected filename (case insensitive) |
| ----------------------- | ------------------------------------ |
| Ultimate Doom           | `doom.wad`                           |
| Doom II                 | `doom2.wad`                          |
| The Plutonia Experiment | `plutonia.wad`                       |
| TNT: Evilution          | `tnt.wad`                            |
| No Rest for the Living  | `nerve.wad`                          |
| SIGIL                   | `sigil.wad`                          |
| SIGIL II                | `sigil2.wad`                         |
| Legacy of Rust          | `id1.wad`                            |
| Freedoom: Phase 1       | `freedoom1.wad`                      |
| Freedoom: Phase 2       | `freedoom2.wad`                      |

Unlike the rest of `config.json`, **changing this value will require the server to be restarted**.

### Source ports

The `ports` object format is as follows:

```js
{
  "ports": {
    "crispy": {                              // the key can be anything you want
      "path": "crispy-doom",                 // the actual command that runs Crispy Doom on your system
      "setupPath": "crispy-doom-setup",      // (optional) the actual command that runs Crispy Doom's distinct setup program
      "compLevels": {
        "final": "-gameversion final",       // List the complevels Crispy Doom supports,
        "ultimate": "-gameversion ultimate", // and command line parameters for each
        "doom2": "-gameversion 1.9"
      }
    }
  }
}
```

The `compLevels` object lists the complevels supported by a given source port, alongside the specific parameters required to run that source port with each complevel. The following keys are supported:

| Key       | Description                                    | [DSDA](https://doomwiki.org/wiki/Compatibility#Speedrunning) equivalent |
| --------- | ---------------------------------------------- | ----------------------------------------------------------------------- |
| `doom2`   | Vanilla (Doom II 1.9)                          | 2                                                                       |
| `udoom`   | Vanilla (Ultimate Doom)                        | 3                                                                       |
| `final`   | Vanilla (Final Doom)                           | 4                                                                       |
| `vanilla` | Vanilla-esque                                  | -                                                                       |
| `boom`    | Boom-compatible                                | 9                                                                       |
| `mbf`     | MBF-compatible                                 | 11                                                                      |
| `mbf21`   | MBF21-compatible                               | 21                                                                      |
| `id24`    | ID24-compatible (not really useful yet AFAICT) | 24?                                                                     |
| `default` | Source port defaults                           | -                                                                       |

Note: `vanilla` and `default` are typically used with source ports such as UZDoom, which support beyond-standards maps but don't provide the option to faithfully emulate a specific vanilla game version.

You may define any number of these complevels for any given source port, the idea being to match what the source port can do. [A fully working configuration example](https://github.com/neemzy/vincent/blob/main/config.example.json) with several source ports (including those UZDoom flags noone could possibly ever memorize, you're welcome) is provided.

Let's add a second, slightly more complete example, this time using the Woof! source port:

```json
{
  "ports": {
    "crispy": {
      "path": "crispy-doom",
      "setupPath": "crispy-doom-setup",
      "compLevels": {
        "final": "-gameversion final",
        "ultimate": "-gameversion ultimate",
        "doom2": "-gameversion 1.9"
      }
    },
    "woof": {
      "path": "/path/to/woof",
      "setupPath": "/path/to/woof-setup",
      "compLevels": {
        "mbf21": "-complevel mbf21",
        "mbf": "-complevel mbf",
        "boom": "-complevel boom",
        "vanilla_final": "-complevel vanilla -gameversion final",
        "vanilla_udoom": "-complevel vanilla -gameversion ultimate",
        "vanilla_doom2": "-complevel vanilla -gameversion 1.9"
      }
    }
  }
}
```

### Profiles

The `profiles` array format is as follows:

```js
{
  "profiles": [
    {
      "title": "Crispy Doom", // the profile name as it will be displayed in the interface
      "port": "crispy"        // the key of the source port to use
    },
    {
      "title": "Woof!",
      "port": "woof"
    },
    {
      "title": "Woof! (UV -fast)",
      "port": "woof",
      "defaultSkill": 4,
      "params": "-fast"
    }
  ]
}
```

Profiles allow you to use one source port in multiple ways by defining alternative default skill levels (`defaultSkill`: `number` from 1 (ITYTD) to 5 (NM)) and/or parameters (`params`: `string` or `Array<string>`). I like to use it to have both freelook and non-freelook profiles for UZDoom (once again, see `config.example.json` for that).

Profiles should be ordered from the most strict / least compatible source port (e.g. Chocolate Doom) to the least strict / most compatible one (e.g. UZDoom) in order to benefit the most from the autoselection feature (more on that below).

### Default skill level

It is also possible to set `defaultSkill` at the config root, defining a default skill level for all source ports that don't do their own. In case none is defined, the default is 3 (HMP).

## Usage

Run the server:

```sh
$ npm start

> start
> node src/server.js

Vincent is running: http://localhost:8666
```

Then browse the printed URL to access the web interface. You might want to add `(cd /path/to/vincent && npm start)` to your `.bashrc` or equivalent, or use a tool such as [PM2](https://pm2.keymetrics.io/) to keep the server running at all times.

![User interface](https://raw.githubusercontent.com/neemzy/vincent/refs/heads/main/ui.jpg)

### stuff to write down

- ID24-specific resource files (i.e. `id24res.wad` and `extras.wad`) will be ignored as capable source ports typically autoload these anyway
- thanks https://github.com/jmickle66666666/wad-js
- copy to clipboard by clicking command line preview
- autoselect settings: detect complevel and 1st map name, select complevel, source port, game and episode
