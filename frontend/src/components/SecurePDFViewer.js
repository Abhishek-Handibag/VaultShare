import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import { Box, IconButton } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const SecurePDFViewer = ({ url }) => {
    const canvasRef = useRef(null);
    const [pdf, setPdf] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const renderTaskRef = useRef(null); // Store reference to current render task

    useEffect(() => {
        let isMounted = true;
        const loadPDF = async () => {
            try {
                const loadingTask = pdfjsLib.getDocument(url);
                const pdf = await loadingTask.promise;
                if (isMounted) {
                    setPdf(pdf);
                    setTotalPages(pdf.numPages);
                    renderPage(1, pdf);
                }
            } catch (error) {
                console.error('Error loading PDF:', error);
            }
        };
        loadPDF();

        return () => {
            isMounted = false;
            // Cancel any ongoing render task
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }
        };
    }, [url]);

    const renderPage = async (pageNum, pdfDoc) => {
        const pdfDocument = pdfDoc || pdf;
        if (!pdfDocument) return;

        // Cancel any ongoing render task
        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
        }

        try {
            const page = await pdfDocument.getPage(pageNum);
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Clear previous content
            context.clearRect(0, 0, canvas.width, canvas.height);

            const viewport = page.getViewport({ scale: 1.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };

            renderTaskRef.current = page.render(renderContext);
            await renderTaskRef.current.promise;
            setCurrentPage(pageNum);
        } catch (error) {
            if (error.name !== 'RenderingCancelled') {
                console.error('Error rendering page:', error);
            }
        }
    };

    const changePage = (delta) => {
        const newPage = currentPage + delta;
        if (newPage >= 1 && newPage <= totalPages) {
            renderPage(newPage);
        }
    };

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'auto',
                userSelect: 'none', // Prevent text selection
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
            onContextMenu={(e) => e.preventDefault()} // Prevent right-click
        >
            <canvas
                ref={canvasRef}
                style={{
                    maxWidth: '100%',
                    height: 'auto'
                }}
            />
            <Box sx={{
                display: 'flex',
                gap: 2,
                mt: 2,
                alignItems: 'center'
            }}>
                <IconButton
                    onClick={() => changePage(-1)}
                    disabled={currentPage <= 1}
                >
                    <NavigateBeforeIcon />
                </IconButton>
                <span>{`${currentPage} / ${totalPages}`}</span>
                <IconButton
                    onClick={() => changePage(1)}
                    disabled={currentPage >= totalPages}
                >
                    <NavigateNextIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default SecurePDFViewer;