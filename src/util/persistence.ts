export type PersistenceType = "PLAIN" | "JSON"

class Persistence {
  protected readonly name: string

  constructor(name: string) {
    this.name = name
  }
}

export class PersistenceString extends Persistence {
  save(data: any) {
    window.localStorage.setItem(this.name, data)
  }

  read(): string | null {
    return window.localStorage.getItem(this.name)
  }
}

export class PersistenceJson extends Persistence {
  private persistence = new PersistenceString(this.name)

  save(data: any) {
    data = JSON.stringify(data)
    this.persistence.save(data)
  }

  read(): object | null {
    const data = this.persistence.read()
    if (data !== null) {
      try {
        return JSON.parse(data)
      } catch (e) {}
    }
    return null
  }
}
