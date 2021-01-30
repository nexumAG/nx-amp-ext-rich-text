import React from "react";

import { init, SDK } from "dc-extensions-sdk";
import { SdkContext, withTheme } from "unofficial-dynamic-content-ui";
import EditorRichTextField from "./EditorRichTextField/EditorRichTextField";
import { RichTextDialogsContainer } from "./RichTextDialogs";

interface AppState {
  connected: boolean;
  sdk?: SDK;
  value?: any;
}

export default class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = { connected: false };
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleChooseLink = this.handleChooseLink.bind(this);
  }

  public componentDidMount(): void {
    this.handleConnect();
  }

  public async handleConnect(): Promise<void> {
    const sdk: SDK = await init();
    sdk.frame.startAutoResizer();

    const value: any = await sdk.field.getValue();

    this.setState({
      sdk,
      connected: true,
      value
    });
  }

  public handleValueChange(locale: any, localeValue: any): void {
    if(this.state.value){
      this.setState(prevState => {
        const value = {...prevState.value};
        value.values[this.state.sdk ? this.state.sdk.locales.default.findIndex((x:any) => x === locale) : 0] = {
          locale,
          value: localeValue
        };
        return { value };
      }, () => {
        if (this.state.connected && this.state.sdk) {
          this.state.sdk.field.setValue(this.state.value);
        }
      });
    }
  }

  public async handleChooseLink(): Promise<{ href: string; title: string }> {
    return { href: "", title: "" };
  }

  public render(): React.ReactElement {
    const { connected, value, sdk } = this.state;

    return (
      <div className="App">
        {connected && sdk ? (
          <div>
            {
              withTheme(
                <SdkContext.Provider value={{ sdk }}>
                <RichTextDialogsContainer>
                  <EditorRichTextField onChange={this.handleValueChange} value={value} locales={sdk.locales} schema={sdk.field.schema} />
                </RichTextDialogsContainer>
              </SdkContext.Provider>
              )
            }
          </div>
        ) : (
          <div>&nbsp;</div>
        )}
      </div>
    );
  }
}
