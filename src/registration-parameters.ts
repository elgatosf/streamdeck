import { RegistrationInfo } from "./defs/registration-info";

export class RegistrationParameters {
  public readonly port: string;
  public readonly pluginUUID: string;
  public readonly event: string;
  public readonly info: RegistrationInfo;

  constructor(args: string[]) {
    if (args.length !== 8) {
      throw new Error(
        `Failed to parse registration information: The supplied number of arguments is invalid, expected 8 but was ${args.length}.`
      );
    }

    for (var i = 0; i < args.length - 1; i++) {
      var param = args[i];
      var value = args[++i];

      if (value === undefined || value === null) {
        throw new Error(
          `Failed to parse registration information: The ${param} parameter cannot be undefined or null.`
        );
      }

      switch (param) {
        case "-port":
          this.port = value;
          break;

        case "-pluginUUID":
          this.pluginUUID = value;
          break;

        case "-registerEvent":
          this.event = value;
          break;

        case "-info":
          this.info = JSON.parse(value);
          break;

        default:
          i--;
          break;
      }
    }
  }
}
