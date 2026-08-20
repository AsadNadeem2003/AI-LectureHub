"""Slide Segment Mapper service for creating synchronized lecture segments."""

from typing import List, Dict, Any
from app.models import ExtractedPage, LectureSegmentOut


class SegmentMapper:
    """Combines text, slide images, LLM transcript sections, and audio timestamps."""

    def create_synchronized_segments(
        self,
        pages: List[ExtractedPage],
        slide_timings: List[Dict[str, Any]]
    ) -> List[LectureSegmentOut]:
        """Construct structured LectureSegmentOut list for frontend interactive player sync."""
        page_image_map = {page.page_number: page.images for page in pages}
        segments: List[LectureSegmentOut] = []

        for idx, timing in enumerate(slide_timings):
            p_num = timing.get("page_number", idx + 1)
            images = timing.get("images") or page_image_map.get(p_num, [])

            segment = LectureSegmentOut(
                segment_index=idx,
                segment_text=timing.get("script_text", ""),
                page_number=p_num,
                image_urls=images,
                start_time_ms=timing.get("start_time_ms", 0),
                end_time_ms=timing.get("end_time_ms", 0),
                keywords=timing.get("keywords", [])
            )
            segments.append(segment)

        return segments


# Global instance
segment_mapper = SegmentMapper()
