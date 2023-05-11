import { RegistrationParameters } from "./registration-parameters";

class StreamDeck {
  constructor(
    private readonly params = new RegistrationParameters(process.argv)
  ) {
    // todo: connect.
  }

  public get info() {
    return this.params.info;
  }

  public get pluginUUID() {
    return this.params.pluginUUID;
  }
}

export default new StreamDeck();
