import ora, { Options as OraOptions, Ora } from 'ora';

/**
 * The Spinner class Ora instance.
 */
class Spinner {
  public static enabled = true;

  private static instance: Ora;
  private static asdf: string | OraOptions = {
    spinner: 'monkey',
    isEnabled: Spinner.enabled,
  };

  /**
   * The Spinner's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {
    //
  }

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Spinner class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): Ora {
    if (!Spinner.instance) {
      Spinner.instance = ora(Spinner.asdf);
      // Spinner._handle(Spinner.instance);
    }

    return Spinner.instance;
  }

  /**
   * Handle the execution on its instance.
   */
  // private static _handle(instance: Ora): void {
  //   //
  // }

  /**
   * Start the spinner.
   *
   * @param {string} text - Set the current text.
   * @returns {void | Ora} The spinner instance if it enabled.
   */
  public static start(text?: string): void | Ora {
    if (!Spinner.enabled) return;

    return Spinner.getInstance().start(text);
  }

  /**
   * Stop the spinner, change it to a green `✔` and persist the current text, or `text` if provided.
   *
   * @param {string} text - Set the current text.
   * @returns {void | Ora} The spinner instance if it enabled.
   */
  public static succeed(text?: string): void | Ora {
    if (!Spinner.enabled) return;

    return Spinner.getInstance().succeed(text);
  }

  /**
   * Stop the spinner, change it to a red `✖` and persist the current text, or `text` if provided.
   *
   * @param {string} text - Set the current text.
   * @returns {void | Ora} The spinner instance if it enabled.
   */
  public static fail(text?: string): void | Ora {
    if (!Spinner.enabled) return;

    return Spinner.getInstance().fail(text);
  }
}

export const spinner = Spinner;
