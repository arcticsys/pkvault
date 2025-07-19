<h1 align="center">PKVault</h1>

Immutable Pokémon storage for Gens I to IX  
Made with <3 by Nova  

# Usage

## Requirements  

```plaintext
System running Linux (optional, but PKVault and Serenity are designed to work best with Linux, therefore the setup will also assume you are using Linux)
bun (bun.sh)
.NET 9.0 (for Serenity)
A little bit of programming knowledge (mainly optional, but can be useful for some of the functionality of PKVault)
Preferably Chromium or a Chromium-based browser such as Google Chrome, Microsoft Edge, Brave, and the like. (Firefox is supported, but uploading saves heavily relies on Webkit APIs that Firefox doesn't have)
```

## Starting PKVault

1. SSH into a Linux system that has a firewall like UFW (or use your local one if you main Linux)
2. Setup UFW/iptables/nftables rules for the port you plan to use to access the PKVault webUI (e.g. sudo ufw allow from 192.168.0.52 to any port 3000 (if port 3000 is the PKVault webUI and 192.168.0.52 is your local IP or VPN IP, NOT PUBLIC IP))
3. `git clone` this repository and `cd` into it
4. Run `git submodule update --recursive --remote` just incase
5. Run `bun install`
6. `cd serenity` and run `dotnet build ./serenity.csproj`, then `cd ..`
7. Run `bun run prepare` (it may error out on a few steps, this is fine, it'll do what it's supposed to either way)
8. Continue with setup in one of the following sections

### Docker setup

9. There is a premade docker-compose.yaml that you can compile with Docker Compose and run off the bat (docker compose up -d OR docker-compose up -d) or you may setup PKVault manually

### Manual setup

9. `bun run build && bun run start` in one terminal
10. Open another terminal and run `bun run serenity`
11. PKVault will be open on port 3000, however, you should seal port 5008 from outside connections completely using your firewall (e.g. sudo ufw deny 3000)
12. You may need to setup systemd services for PKVault to run while your terminals aren't connected to the host

## Updating PKVault

Run `bun run update` and it'll update everything, including running migrations and upgrading Bun for you.

# Backstory

## Why?

PKVault was made because I wanted a backup solution for my Pokémon, one that's solid and just works without issue while not compromising my ability to view all of my cute creatures that I caught.

## When?

I started developing PKVault on 24/02/2025.

## I heard that you made PKVault as your Rite of Passage for school?

Yes, I did!  
Who you probably know me as in real life definitely wouldn't match with this GitHub profile, but believe it or not, I am the same person.  
I've loved Pokémon for a long time, so making a backup tool as my Rite of Passage just made sense, especially since the last backup tool I wanted to make didn't go so well.  
I needed a reason to ensure that PKVault was at the very least released and the Rite of Passage requirement at school made an excuse to reinforce it.  

# Legal jargon (LICENSE)

This project is licensed with OQL v1.2 (with a few extra caveats, scroll down a little to find them).  
Although this technically makes PKVault not free software, I enforce my right as the sole developer of PKVault to choose what license is used.  
I'm not afraid to also enforce this license (alongside each of the caveats I've provided) in the case that it is violated.  

## Legally binding caveats

This project and it's source code may not be used commercially without explicit permission from each contributor of the project or the requested section(s) of source code.  
You may not sublicense this project and any section of source code with a license that is less restrictive than the original license unless you have explicit written permission to do so.

<a href="https://oql.avris.it/license/v1.2.md?c=Nova%20Arctic%7Chttps%3A%2F%2Fgit.zeusteam.dev%2Farcticsys%2Fpkvault" target="_blank" rel="noopener"><img src="https://badgers.space/badge/License/OQL/pink" alt="License: OQL" style="vertical-align: middle;"/></a>
