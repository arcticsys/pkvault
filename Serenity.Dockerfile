FROM mcr.microsoft.com/dotnet/sdk:9.0
RUN apt-get update && apt-get install -y wget
RUN wget https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb -O packages-microsoft-prod.deb && dpkg -i packages-microsoft-prod.deb && rm packages-microsoft-prod.deb
RUN apt-get update && apt-get install -y aspnetcore-runtime-9.0 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENTRYPOINT [ "dotnet", "watch", "run", "./serenity.csproj" ]