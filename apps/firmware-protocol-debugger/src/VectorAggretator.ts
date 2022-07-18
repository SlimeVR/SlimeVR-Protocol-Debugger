export class VectorAggregator {
  private readonly samples: number[] = new Array(this.components).fill(0);
  private readonly averages: number[] = new Array(this.components).fill(0);
  private readonly deviances: number[] = new Array(this.components).fill(0);
  private readonly variance: number[] = new Array(this.components).fill(0);
  private readonly mins: number[] = new Array(this.components).fill(0);
  private readonly maxs: number[] = new Array(this.components).fill(0);

  private _latestData = new Array(this.components).fill(0);

  constructor(private readonly components: number) {}

  update(raw: number[]) {
    if (raw.length !== this.components) {
      throw new Error(`Expected ${this.components} components, got ${raw.length}`);
    }

    for (let component = 0; component < raw.length; component++) {
      const value = raw[component];

      const previousSamples = this.samples[component];
      const previousAverage = this.averages[component];
      const previousVariance = this.variance[component];

      const samples = previousSamples + 1;

      const average = (previousAverage * samples + value) / (samples + 1);
      const variance = ((samples - 1) * previousVariance + (value - average) * (value - previousAverage)) / samples;
      const deviance = Math.sqrt(variance);

      this.averages[component] = average;
      this.variance[component] = variance;
      this.deviances[component] = deviance;
      this.samples[component] = samples;
      this.mins[component] = Math.min(this.mins[component], value);
      this.maxs[component] = Math.max(this.maxs[component], value);
    }

    this._latestData = raw;
  }

  toString() {
    const output = [`S: ${this.samples[0].toString().padStart(8, ' ')}`];

    for (let component = 0; component < this.components; component++) {
      output.push(
        `${component}: ${this.averages[component].toFixed(12).padStart(18, ' ')} ${this.deviances[component]
          .toFixed(12)
          .padStart(18, ' ')} (${this.mins[component].toFixed(12).padStart(18, ' ')} - ${this.maxs[component]
          .toFixed(12)
          .padStart(18, ' ')})`
      );
    }

    return output.join(' | ');
  }

  get latestData() {
    return this._latestData;
  }
}
