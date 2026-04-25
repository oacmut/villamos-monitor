import os
import time
import requests
from datetime import datetime
from dotenv import load_dotenv
from rich.console import Console
from rich.table import Table
from rich.live import Live

load_dotenv()


API_KEY = os.getenv("BKK_API_KEY")


API_URL = "https://go.bkk.hu/api/query/v1/ws/otp/api/where/arrivals-and-departures-for-stop.json"


STOPS = {
    "MÜPA - Nemzeti Színház": "BKK_F01397",
    "Vágóhíd utca": "BKK_F01399"
}

def get_arrivals(stop_id):
    """Lekéri az adatokat a BKK szerveréről."""
    params = {
        "stopId": stop_id,
        "minutesBefore": "0",
        "minutesAfter": "30",
        "key": API_KEY
    }
    
    try:
        res = requests.get(API_URL, params=params)
        res.raise_for_status()
        return res.json()
    except Exception:
        return None

def parse_arrivals(data):
    """Kibontja és kiszámolja a hátralévő perceket a JSON-ből."""
    if not data or 'data' not in data or 'entry' not in data['data']:
        return []
    

    stop_times = data['data']['entry'].get('stopTimes', [])
    references = data['data'].get('references', {})
    
    routes_info = references.get('routes', {})
    trips_info = references.get('trips', {})
    
    arrivals = []
    current_time = int(time.time())
    
    for st in stop_times:

        trip_id = st.get('tripId', '')
        

        route_id = trips_info.get(trip_id, {}).get('routeId', '')
        

        short_name = routes_info.get(route_id, {}).get('shortName', '')
        

        if short_name not in ["2", "2B"]:
            continue
            

        arrival_time = st.get('predictedArrivalTime', st.get('arrivalTime'))
        if not arrival_time:
            continue
            
        minutes = int((arrival_time - current_time) / 60)
        if minutes < 0:
            continue
            
        headsign = st.get('stopHeadsign', 'Ismeretlen irány')
        
        arrivals.append({
            "route": short_name,  
            "headsign": headsign,
            "minutes": minutes
        })
        

    return sorted(arrivals, key=lambda x: x['minutes'])

def generate_table():
    """Létrehozza a 'fancy' táblázatot."""
    current_time_str = datetime.now().strftime("%H:%M:%S")
    
    if not API_KEY:
        table = Table(title="[bold red]Hiba: Nincs BKK_API_KEY az .env fájlban![/bold red]")
        return table

    table = Table(
        title="🚋 [bold cyan]Egyetemi Villamos Monitor (Fővám tér felé)[/bold cyan] 🚋", 
        caption=f"[dim]Utolsó frissítés: {current_time_str} | Frissít 10 másodpercenként...[/dim]",
        style="cyan",
        header_style="bold magenta"
    )
    
    table.add_column("Megálló", width=30)
    table.add_column("Célállomás (Irány)", style="blue")
    table.add_column("Érkezés", justify="right")
    
    for stop_name, stop_id in STOPS.items():
        data = get_arrivals(stop_id)
        arrivals = parse_arrivals(data)
        
        if not arrivals:
            table.add_row(f"[bold]{stop_name}[/bold]", "Nincs járat 30 percen belül", "---")
        else:
            for i, arr in enumerate(arrivals):
                if i > 1:
                    break
                
                if arr['minutes'] == 0:
                    time_str = "[bold red blink]Most érkezik![/bold red blink]"
                else:
                    time_str = f"[bold green]{arr['minutes']} perc[/bold green]"
                
                table.add_row(
                    f"[bold]{stop_name}[/bold] ({arr['route']})" if i == 0 else f"   ({arr['route']})", 
                    arr['headsign'], 
                    time_str
                )
        table.add_section() 
        
    return table

def main():
    console = Console()
    console.clear()
    
    with Live(generate_table(), refresh_per_second=1, screen=True) as live:
        while True:
            time.sleep(10) 
            live.update(generate_table())

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        Console().print("\n[bold red]Monitorozás leállítva. Jó utat az egyetemre![/bold red]")