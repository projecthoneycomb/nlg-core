interface IModel {
  name: string
  version: {
    model: string
    api: string
  }
  describe: string[]
  entities: Array<IEntity | IDateEntity | ICountEntity>
  nuances?: string[],
  axis: IBasicRange
  display: IDisplayOptions
  data: IText[]
}

interface IText {
  range: IBasicRange
  describe: string[]
  explain?: string[]
  advise?: string[]
  associated: {
    entities: string[]
    nuances?: INuance[]
  }
}

interface INuance {
  nuance: string
  values: string[]
}

interface IBasicRange {
  primary: {
    from: number
    to: number
    threshold: number
  },
  turbulence: {
    from: number
    to: number
    threshold: number
  }
}

interface IDisplayOptions {
  resolution: {
    x: number
    y: number
  }
}

interface IEntity {
  id: string
  name: string
  type: "basic" | "count" | "date"
}

interface IDateEntity extends IEntity {
  type: "date"
  options: {
    format: "calendar"
  }
}

interface ICountEntity extends IEntity {
  type: "count"
  options: {
    descriptor: string
    pluralize: boolean
  }
}

export { IModel, IBasicRange, IEntity, IText };