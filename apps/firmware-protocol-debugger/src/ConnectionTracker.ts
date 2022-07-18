import { Tracker } from './Tracker';

export class ConnectionTracker {
  private static instance: ConnectionTracker;

  static get() {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }

  private readonly connectionsByMAC = new Map<string, Tracker>();
  private readonly connectionsByIP = new Map<string, Tracker>();

  private log(msg: string) {
    console.log(`[ConnectionTracker] ${msg}`);
  }

  getConnectionByIP(ip: string) {
    return this.connectionsByIP.get(ip);
  }

  getConnectionByMAC(mac: string) {
    return this.connectionsByMAC.get(mac);
  }

  addConnection(tracker: Tracker) {
    this.connectionsByIP.set(tracker.getIP(), tracker);

    this.log(`Added tracker ${tracker.getIP()}`);

    if (tracker.getMAC()) {
      this.connectionsByMAC.set(tracker.getMAC(), tracker);
      this.log(`Added tracker ${tracker.getMAC()}`);
    }
  }

  removeConnectionByIP(ip: string) {
    const connection = this.connectionsByIP.get(ip);

    if (connection && connection.getMAC()) {
      this.connectionsByMAC.delete(connection.getMAC());

      this.log(`Removed tracker ${connection.getMAC()}`);
    }

    this.connectionsByIP.delete(ip);

    this.log(`Removed tracker ${ip}`);
  }

  removeConnectionByMAC(mac: string) {
    const connection = this.connectionsByMAC.get(mac);

    if (connection) {
      this.connectionsByIP.delete(connection.getIP());

      this.log(`Removed tracker ${connection.getIP()}`);
    }

    this.connectionsByMAC.delete(mac);

    this.log(`Removed tracker ${mac}`);
  }

  removeOldConnections() {
    for (const tracker of this.connectionsByIP.values()) {
      if (!tracker.alive) {
        this.removeConnectionByIP(tracker.getIP());

        this.log(`Tracker ${tracker.getIP()} timed out`);
      }
    }

    for (const tracker of this.connectionsByMAC.values()) {
      if (!tracker.alive) {
        this.removeConnectionByMAC(tracker.getMAC());

        this.log(`Tracker ${tracker.getMAC()} timed out`);
      }
    }
  }

  pingConnections() {
    for (const tracker of this.connectionsByIP.values()) {
      tracker.ping();
    }
  }
}
