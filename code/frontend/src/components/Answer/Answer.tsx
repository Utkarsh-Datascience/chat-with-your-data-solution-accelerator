import { useEffect, useMemo, useState } from "react";
import { useBoolean } from "@fluentui/react-hooks"
import { FontIcon, Stack, Text } from "@fluentui/react";

import styles from "./Answer.module.css";

import { AskResponse, Citation } from "../../api";
import { parseAnswer } from "./AnswerParser";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import supersub from 'remark-supersub';

import moment from "moment";

interface Props {
    answer: AskResponse;
    onCitationClicked: (citedDocument: Citation) => void;
    index: number;
}

export const Answer = ({
    answer,
    onCitationClicked,
    index,
}: Props) => {
    const [isRefAccordionOpen, { toggle: toggleIsRefAccordionOpen }] = useBoolean(false);
    const filePathTruncationLimit = 50;

    const messageBoxId = "message-" + index;

    const parsedAnswer = useMemo(() => parseAnswer(answer), [answer]);
    const [chevronIsExpanded, setChevronIsExpanded] = useState(isRefAccordionOpen);

    const handleChevronClick = () => {
        setChevronIsExpanded(!chevronIsExpanded);
        toggleIsRefAccordionOpen();
      };

    useEffect(() => {
        setChevronIsExpanded(isRefAccordionOpen);
        console.log('parsedAnswer: ', parsedAnswer);
    }, [isRefAccordionOpen]);

    const createCitationFilepath = (citation: Citation, index: number, truncate: boolean = false) => {
        let citationFilename = "";

        if (citation.filepath && citation.chunk_id != null) {
            if (truncate && citation.filepath.length > filePathTruncationLimit) {
                const citationLength = citation.filepath.length;
                citationFilename = `${citation.filepath.substring(0, 20)}...${citation.filepath.substring(citationLength -20)} - Part ${parseInt(citation.chunk_id) + 1}`;
            }
            else {
                citationFilename = `${citation.filepath} - Part ${parseInt(citation.chunk_id) + 1}`;
            }
        }
        else {
            citationFilename = `Citation ${index}`;
        }
        return citationFilename;
    }

    useEffect(() => {
        const handleCopy = () => {
            alert("Please consider where you paste this content.");
        };
        const messageBox = document.getElementById(messageBoxId);
        messageBox?.addEventListener("copy", handleCopy);
        // console.log('citations: ', parsedAnswer.citations);
        return () => {
            messageBox?.removeEventListener("copy", handleCopy);
        };
    }, []);

    return (
        <>
          {parsedAnswer.citations.length > 0 && (
            <Stack className={`${styles.answerContainer}`} id={messageBoxId}>
              <Stack horizontal className={` ${styles.answerFooter} `} verticalAlign="start">

                <span className={styles.sourcesTitle}>Sources</span>

                {/* ↓ Handeling this another way per comps */}
                {/* <Stack.Item className={styles.answerDisclaimerContainer}>
                    <span className={`${styles.answerDisclaimer} ${styles.mobileAnswerDisclaimer}`}>AI-generated content may be incorrect</span>
                </Stack.Item> */}

                {/* {!!parsedAnswer.citations.length && (
                    <Stack.Item aria-label="References">
                        <Stack style={{width: "100%"}} >
                            <Stack horizontal horizontalAlign='start' verticalAlign='center'>
                                <Text
                                    className={styles.accordionTitle}
                                    onClick={toggleIsRefAccordionOpen}
                                >
                                <span>{parsedAnswer.citations.length > 1 ? parsedAnswer.citations.length + " references" : "1 reference"}</span>
                                </Text>
                                <FontIcon className={styles.accordionIcon}
                                onClick={handleChevronClick} iconName={chevronIsExpanded ? 'ChevronDown' : 'ChevronRight'}
                                />
                            </Stack>

                        </Stack>
                    </Stack.Item>
                )} */}

                {/* ↓ not nesting the citations per design */}
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", height: "100%", gap: "4px", maxWidth: "100%" }}>
                    {parsedAnswer.citations.map((citation, idx) => {
                        return (
                            <span title={createCitationFilepath(citation, ++idx)} key={idx} onClick={() => onCitationClicked(citation)} className={styles.citationContainer}>
                                <div className={styles.citation}>{idx}</div>
                                {/* {createCitationFilepath(citation, idx, true)} */}
                                <div className={styles.citationTitle}>{citation.metadata?.title || 'Citation'}</div>
                                <div className={styles.citationSource}>•&nbsp;&nbsp;{citation.metadata?.source || 'Source'}</div>
                            </span>);
                    })}
                </div>

              </Stack>
                {/* {chevronIsExpanded &&
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", height: "100%", gap: "4px", maxWidth: "100%" }}>
                        {parsedAnswer.citations.map((citation, idx) => {
                            return (
                                <span title={createCitationFilepath(citation, ++idx)} key={idx} onClick={() => onCitationClicked(citation)} className={styles.citationContainer}>
                                    <div className={styles.citation}>{idx}</div>
                                    {createCitationFilepath(citation, idx, true)}
                                </span>);
                        })}
                    </div>
                } */}
            </Stack>
          )}

          <div className={`${styles.answerContainer} ${styles.answerProntoResponse}`}>
            <Stack.Item grow>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, supersub]}
                    children={parsedAnswer.markdownFormatText}
                    className={styles.answerText}
                />
            </Stack.Item>
          </div>

          {parsedAnswer.citations.length > 0 && (
            <div className={` ${styles.answerNewFooter}`}>
              <div>{moment().calendar()}</div>
              {/* <div>{moment().format("dddd [at] HH:mm")}</div> */}
              <div>•</div>
              <div>AI-generated content may be incorrect</div>
            </div>
          )}
        </>
    );
};
