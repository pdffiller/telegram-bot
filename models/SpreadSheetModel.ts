import { google } from "googleapis";
import fs from "fs";
import readline from "readline";
import { OAuth2Client } from "googleapis-common";
import { Credentials } from "google-auth-library";
import { GaxiosResponse } from "gaxios";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

interface OAuthCallback {
  (auth: OAuth2Client): void;
}

interface ICredentialsJson {
  installed: {
    client_secret: string;
    client_id: string;
    redirect_uris: string[];
  };
}
export default class SpreadSheetModel {
  protected auth: OAuth2Client;
  protected sheets = google.sheets("v4");

  constructor(protected credentialsPath: string, protected tokenPath: string) {
    this.init();
  }

  protected init() {
    // Load client secrets from a local file.
    fs.readFile(this.credentialsPath, "utf-8", (err, content) => {
      if (err) return console.log("Error loading client secret file:", err);
      // Authorize a client with credentials, then call the Google Sheets API.
      this.authorize(JSON.parse(content), (auth) => (this.auth = auth));
    });
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  authorize(credentials: ICredentialsJson, callback: OAuthCallback) {
    const {
      client_secret,
      client_id,
      redirect_uris = [],
    } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(this.tokenPath, "utf-8", (err, token) => {
      if (err) return this.getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  getNewToken(oAuth2Client: OAuth2Client, callback: OAuthCallback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter the code from that page here: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err)
          return console.error(
            "Error while trying to retrieve access token",
            err
          );
        oAuth2Client.setCredentials(token as Credentials);
        // Store the token to disk for later program executions
        fs.writeFile(this.tokenPath, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log("Token stored to", this.tokenPath);
        });
        callback(oAuth2Client);
      });
    });
  }

  addRowsToTable(
    spreadsheetId: string,
    range: string,
    rows: string[][]
  ): Promise<GaxiosResponse | null> {
    const request = {
      // The ID of the spreadsheet to update.
      spreadsheetId,

      // The A1 notation of a range to search for a logical table of data.
      // Values will be appended after the last row of the table.
      range,

      // How the input data should be interpreted.
      valueInputOption: "USER_ENTERED", // TODO: Update placeholder value.

      resource: {
        values: rows,
      },

      auth: this.auth,
    };

    return new Promise((resolve, reject) =>
      this.sheets.spreadsheets.values.append(
        request,
        (err: Error | null, res: GaxiosResponse | null | undefined) => {
          return err ? reject(err) : resolve(res);
        }
      )
    );
  }
}
