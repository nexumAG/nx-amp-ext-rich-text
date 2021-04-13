import React from "react";

import {Box, Tab, Tabs, Typography, withStyles, WithStyles} from "@material-ui/core";

import { ToolbarElement } from "../ProseMirrorToolbar";
import { RichTextEditor } from "../RichTextEditor";

import JSONLanguage from "@dc-extension-rich-text/language-json";
import MarkdownLanguage from "@dc-extension-rich-text/language-markdown";
import { ContentTypeSettings, SdkContext } from "unofficial-dynamic-content-ui";

import {
  RichLanguage,
  RichLanguageConfiguration
} from "@dc-extension-rich-text/common";
import {
  DcContentLinkView,
  DcImageLinkView,
  DynamicContentToolOptions
} from "@dc-extension-rich-text/prosemirror-dynamic-content";
import { RichTextDialogsContext } from "../RichTextDialogs";

export const styles = {
  root: {
    width: "100%"
  },
  title: {
    padding: "7px 0",
    minHeight: "20px",
    color: "#666",
    fontSize: "13px",
    boxSizing: "border-box" as "border-box",
    "-webkit-font-smoothing": "auto",
    fontFamily: "roboto,sans-serif!important"
  }
};

export interface EditorRichTextFieldProps extends WithStyles<typeof styles> {
  schema: any;
  value?: any;
  locales?: any;
  onChange?: (locale: any, localeValue: any) => void;
}

export interface EditorRichTextFieldParams {
  title?: string;
  language?: string;

  styles?: string;
  stylesheet?: string;

  useClasses?: boolean;
  classOverride?: { [originalName: string]: string };

  codeView?: {
    readOnly?: boolean;
    disabled?: boolean;
  };

  editView?: {};

  toolbar?: {
    layout?: ToolbarElement[];
    disabled?: boolean;
  };

  tools?: {
    whitelist?: string[];
    blacklist?: string[];

    "dc-content-link"?: {
      contentTypes?: string[];
      contentTypeSettings?: ContentTypeSettings & {
        aspectRatios?: { [schemaId: string]: string };
      };
    };
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

// tslint:disable-next-line:typedef
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const EditorRichTextField: React.SFC<EditorRichTextFieldProps> = (
  props: EditorRichTextFieldProps
) => {
  const { schema, value: valueProp, locales, onChange, classes } = props;
  const [tabsValue, setTabsValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabsValue(newValue);
  };

  const params: EditorRichTextFieldParams =
    schema && schema["ui:extension"] && schema["ui:extension"].params
      ? schema["ui:extension"].params
      : {};

  const { sdk } = React.useContext(SdkContext);
  const { dialogs } = React.useContext(RichTextDialogsContext);

  const toolOptions = React.useMemo<DynamicContentToolOptions>(() => {
    const settings = {
      useClasses: params.useClasses,
      classOverride: params.classOverride,

      dialogs,
      dynamicContent: {
        stagingEnvironment: sdk ? sdk.stagingEnvironment : undefined
      },
      tools: params.tools
    };

    if (settings.tools && !settings.tools.blacklist) {
      // disable inline_styles by default
      settings.tools.blacklist = ["inline_styles"];
    }

    return settings;
  }, [sdk, dialogs, params]);

  const languages = React.useMemo<{
    [name: string]: { language: RichLanguage; conf: RichLanguageConfiguration };
  }>(() => {
    return {
      markdown: MarkdownLanguage(toolOptions),
      json: JSONLanguage(toolOptions)
    };
  }, []);

  const language = params.language || "markdown";

  const editorViewOptions = React.useMemo(() => {
    return {
      nodeViews: {
        "dc-image-link": (node: any, view: any, getPos: any) =>
          new DcImageLinkView(node, view, getPos, toolOptions),
        "dc-content-link": (node: any, view: any, getPos: any) =>
          new DcContentLinkView(node, view, getPos, toolOptions)
      }
    };
  }, [sdk, toolOptions]);

  return (
    <div className={classes.root}>
      {params.styles ? (
        <style dangerouslySetInnerHTML={{ __html: params.styles }} />
      ) : false}
      {params.stylesheet ? (
        <link rel="stylesheet" href={params.stylesheet} />
      ) : false}

      {params.title ? (
        <div className={classes.title}>{params.title}</div>
      ) : false}

      <Tabs value={tabsValue} onChange={handleChange} indicatorColor="primary" aria-label="tabs">
        {locales.available ? locales.available.map((locale: any) => {
          return(<Tab key={locale} label={locale.country}/>);
        }) : null}
      </Tabs>
      {locales.default ? locales.default.map((locale: any, index: number) => {
        return (
          <TabPanel key={locale} value={tabsValue} index={index}>
            <RichTextEditor
              key={locale}
              languages={languages}
              language={params.language}
              editorViewOptions={editorViewOptions}
              toolbarLayout={params.toolbar ? params.toolbar.layout : undefined}
              disableToolbar={params.toolbar ? params.toolbar.disabled : undefined}
              disableCodeView={params.codeView ? params.codeView.disabled : undefined}
              readOnlyCodeView={
                params.codeView ? params.codeView.readOnly : undefined
              }
              locale={locale}
              onChange={onChange}
              value={valueProp.values ? valueProp.values.find((value:any) => value.locale === locale).value : ''}
            />
          </TabPanel>
        );
      }) : null}
    </div>
  );
};

export default withStyles(styles)(EditorRichTextField);
