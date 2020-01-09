import { IModel, IBasicRange, IEntity, IText } from '../types/interfaces/model'
import log from '../helpers/logger';

class Model {

  private model: IModel
  private activeModel: IText[][]

  constructor(model: IModel) {
    this.validateModel(model);
    this.initialiseActiveModel(model);
  }

  private validateModel(model: IModel) {
    return model;
  }

  private initialiseActiveModel(model: IModel) {
    const axis: IBasicRange = model.axis;

    /* 
      [Example numbers; actual values may vary]

      Find number of stops to split active model into descrete values
      1 - (-1) = a range of 2
      2 / 0.2 (threshold)
      = 10 + 1 (To include rounding to 0)
      = 11 (number of descrete elements in array or "stops")
    */

    // Y Axis
    const primaryThreshold = axis.primary.threshold;
    const primaryRange = axis.primary.to - axis.primary.from;
    const primaryStops = (primaryRange / primaryThreshold) + 1;


    /* 
      [Example numbers; actual values may vary]

      Find number of stops to split active model into descrete values
      1 - 0 = a range of 2
      1 / 0.1 (threshold)
      = 10 + 1 (To include rounding to 0)
      = 11 (number of descrete elements in array or "stops")
    */

    // X Axis
    const turbulanceThreshold = axis.turbulence.threshold;
    const turbulenceRange = axis.turbulence.to - axis.turbulence.from;
    const turbulenceStops = (turbulenceRange / turbulanceThreshold) + 1;

    let activeModel = new Array(turbulenceStops) // Make X
    activeModel.fill(null); // Fill X with Y
    activeModel = activeModel.map(() => new Array(primaryStops)) // Fill X with Y

    /*
      We now have an empty grid with the correct number of spaces in each dimention
      each representing a rasterised part of the abstract model.

        0                                 1
     -1 +------+------+------+------+-----+
        |   0  |  0.1 |  0.2 |  0.3 | ... |
        |  -1  |  -1  |  -1  |  -1  | ... |
        +------+------+------+------+-----+
        |   0  |  0.1 |  0.2 |  0.3 | ... |
        | -0.8 | -0.8 | -0.8 | -0.8 | ... |
        +------+------+------+------+-----+
        |   0  |  0.1 |  0.2 |  0.3 | ... |
        | -0.6 | -0.6 | -0.6 | -0.6 | ... |
        +------+------+------+------+-----+
        |  ... |  ... |  ... |  ... | ... |
        |  ... |  ... |  ... |  ... | ... |
      1 +------+------+------+------+-----+
    */

    /* 
      In order to find the most approprate responses the data must be sorted
      from least specific to most specific. In practice, this means calculating the
      range length for each axis and finding the area by mulitplying them, and sorting by
      that number.
    */
    model.data.sort((alpha, beta) => {
      const alphaPrimaryRange = Math.abs(alpha.range.primary.to - alpha.range.primary.from);
      const alphaTurbulenceRange = Math.abs(alpha.range.turbulence.to - alpha.range.turbulence.from);

      const betaPrimaryRange = Math.abs(beta.range.primary.to - beta.range.primary.from);
      const betaTurbulenceRange = Math.abs(beta.range.turbulence.to - beta.range.turbulence.from);

      return (betaPrimaryRange * betaTurbulenceRange) - (alphaPrimaryRange * alphaTurbulenceRange)
    })
    
    for (const entry of model.data) { // Loop over data 
      for (const [x, column] of activeModel.entries()) { // Loop over X
        const currentXBound = (x * axis.turbulence.threshold) + axis.turbulence.from;

        for (const [y] of column.entries()) { // Loop over Y

          /*
            Does the entry apply to the x, y position in the array
          */
          
          const currentYBound = (y * axis.primary.threshold) + axis.primary.from;
          const canBeRepresentedByThisCell = (currentXBound >= entry.range.turbulence.from && currentXBound <= entry.range.turbulence.to)
                                          && (currentYBound >= entry.range.primary.from    && currentYBound <= entry.range.primary.to);

          log(`(${currentXBound} >= ${entry.range.turbulence.from} && ${currentXBound} <= ${entry.range.turbulence.to})
          && (${currentYBound} >= ${entry.range.primary.from} && ${currentYBound} <= ${entry.range.primary.to})`)

          if (canBeRepresentedByThisCell) {
            activeModel[x][y] = entry
          }
        }
      }
    }


    this.model = model;
    this.activeModel = activeModel;

    console.table(activeModel[0].map((x,i) => activeModel.map(x => x[i])).map(row => row.map(cell => cell.id)).reverse())
  }

  getTemplate() {

  }

  validateInput(entities: any) {
    
  }

  query(x: number, y: number) {
    log(x, y)
    const primaryThreshold = this.model.axis.primary.threshold;
    const primaryRange = this.model.axis.primary.to - this.model.axis.primary.from;
    const primaryStops = (primaryRange / primaryThreshold);
    let row = Math.round(y * primaryStops);

    const turbulanceThreshold = this.model.axis.turbulence.threshold;
    const turbulenceRange = this.model.axis.turbulence.to - this.model.axis.turbulence.from;
    const turbulenceStops = (turbulenceRange / turbulanceThreshold);
    let column = Math.round(x * turbulenceStops);

    log(column, row)
    return this.activeModel[column][row]
  }

  generate(entry: IText, entities: any, nuances: any = []) {
    log(entry)
    
    const keys = Object.keys(entities) ?? [];
    const describe = entry.describe ?? this.model.describe ?? []
    const describeText = keys.reduce((text, entity) => {
      return text.replace(`{${entity}}`, entities[entity])
    }, describe[Math.floor(Math.random() * describe.length)]?? '')

    const explain = entry.explain ?? []
    const explainText = keys.reduce((text, entity) => {
      return text.replace(`{${entity}}`, entities[entity])
    }, explain[Math.floor(Math.random() * explain.length)] ?? '')

    const advise = entry.advise ?? []
    const adviseText = keys.reduce((text, entity) => {
      return text.replace(`{${entity}}`, entities[entity])
    }, advise[Math.floor(Math.random() * advise.length)] ?? '')

    const associatedNuances = entry?.associated?.nuances ?? [];
    const nuanceText = associatedNuances.reduce((text, nuance) => {
      if(nuances[nuance.nuance]) {
        text = `${nuance.values[Math.floor(Math.random() * nuance.values.length)]} `
      }
      return text;
    }, '').trim()

    return {
      describe: describeText,
      explain: explainText,
      advise: adviseText,
      nuance: nuanceText,
      meta: entry
    }
  }
}
export default Model